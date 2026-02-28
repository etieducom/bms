# ETI Educom BMS - Hostinger VPS Deployment Guide
## Subdomain: bms.etieducom.com | Folder: /var/www/bms

---

## Prerequisites
- Hostinger VPS with Ubuntu 20.04/22.04
- SSH access to your VPS
- Domain DNS access (for subdomain setup)

---

## Step 1: Connect to VPS & Install Dependencies

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx certbot python3-certbot-nginx git curl

# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install yarn
npm install -g yarn

# Install PM2 for process management
npm install -g pm2
```

---

## Step 2: Setup MongoDB with Authentication (SECURITY)

```bash
# Connect to MongoDB
mongosh

# Create admin user
use admin
db.createUser({
  user: "adminUser",
  pwd: "YOUR_STRONG_ADMIN_PASSWORD",  # Change this!
  roles: ["userAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Create app database user
use eti_educom_prod
db.createUser({
  user: "bmsAppUser",
  pwd: "YOUR_STRONG_APP_PASSWORD",  # Change this!
  roles: ["readWrite"]
})
exit
```

Enable authentication in MongoDB:
```bash
sudo nano /etc/mongod.conf
```

Add/modify these lines:
```yaml
security:
  authorization: enabled

net:
  bindIp: 127.0.0.1
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

---

## Step 3: Setup Application Directory

```bash
# Create directory
sudo mkdir -p /var/www/bms
cd /var/www/bms

# Clone or copy your application files here
# Option 1: Git clone (if you have repo)
# git clone your-repo-url .

# Option 2: SCP from local machine
# scp -r /path/to/your/app/* root@your-vps-ip:/var/www/bms/
```

---

## Step 4: Configure Backend

```bash
cd /var/www/bms/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Create production .env file
cat > .env << 'EOF'
# MongoDB with authentication
MONGO_URL=mongodb://bmsAppUser:YOUR_STRONG_APP_PASSWORD@127.0.0.1:27017/eti_educom_prod?authSource=eti_educom_prod
DB_NAME=eti_educom_prod

# Security - CHANGE THESE IN PRODUCTION!
SECRET_KEY=your-very-long-random-secret-key-min-32-chars-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Your Emergent LLM Key (for AI features)
EMERGENT_LLM_KEY=your-emergent-llm-key

# Frontend URL (for CORS)
FRONTEND_URL=https://bms.etieducom.com

# Optional: MSG91 for WhatsApp
MSG91_AUTH_KEY=your-msg91-key
MSG91_TEMPLATE_ID=your-template-id
EOF
```

**Generate a secure SECRET_KEY:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## Step 5: Configure Frontend

```bash
cd /var/www/bms/frontend

# Create production .env
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=https://bms.etieducom.com
EOF

# Install dependencies and build
yarn install
yarn build
```

---

## Step 6: Setup Nginx with SSL

### 6.1 First, point your subdomain to VPS:
In Hostinger DNS settings, add:
- **Type:** A Record
- **Name:** bms
- **Points to:** Your VPS IP
- **TTL:** 3600

### 6.2 Create Nginx config:

```bash
sudo nano /etc/nginx/sites-available/bms.etieducom.com
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name bms.etieducom.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bms.etieducom.com;
    
    # SSL certificates (will be added by certbot)
    ssl_certificate /etc/letsencrypt/live/bms.etieducom.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bms.etieducom.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Frontend - React build files
    root /var/www/bms/frontend/build;
    index index.html;
    
    # API routes - proxy to backend
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # Frontend routes - SPA support
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

### 6.3 Enable site and get SSL certificate:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/bms.etieducom.com /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Get SSL certificate (run AFTER DNS propagation - wait 5-10 mins)
sudo certbot --nginx -d bms.etieducom.com

# Restart nginx
sudo systemctl restart nginx
```

---

## Step 7: Create PM2 Process Manager

```bash
cd /var/www/bms

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'bms-backend',
      cwd: '/var/www/bms/backend',
      script: 'venv/bin/uvicorn',
      args: 'server:app --host 0.0.0.0 --port 8001',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/www/bms/logs/backend-error.log',
      out_file: '/var/www/bms/logs/backend-out.log'
    }
  ]
};
EOF

# Create logs directory
mkdir -p /var/www/bms/logs

# Start backend with PM2
cd /var/www/bms
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Step 8: Setup Firewall (UFW)

```bash
# Enable firewall
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Block direct access to backend port (only allow via nginx)
sudo ufw deny 8001

# Check status
sudo ufw status
```

---

## Step 9: Create Default Super Admin

```bash
cd /var/www/bms/backend
source venv/bin/activate

python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Check if admin exists
    existing = await db.users.find_one({"email": "admin@etieducom.com"})
    if existing:
        print("Admin already exists!")
        return
    
    admin = {
        "id": str(uuid.uuid4()),
        "email": "admin@etieducom.com",
        "password": pwd_context.hash("ChangeThisPassword123!"),  # CHANGE THIS!
        "name": "Super Admin",
        "role": "admin",
        "branch_id": None,
        "is_active": True
    }
    
    await db.users.insert_one(admin)
    print("Admin created! Email: admin@etieducom.com")
    print("IMPORTANT: Change the password after first login!")
    
    client.close()

asyncio.run(create_admin())
EOF
```

---

## Step 10: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check nginx status  
sudo systemctl status nginx

# Check MongoDB status
sudo systemctl status mongod

# Test API
curl https://bms.etieducom.com/api/health

# Check logs if issues
pm2 logs bms-backend
tail -f /var/www/bms/logs/backend-error.log
```

---

## Security Checklist

- [ ] Changed default SECRET_KEY to random 64+ character string
- [ ] Changed MongoDB passwords from examples
- [ ] Changed default admin password after first login
- [ ] SSL certificate installed (HTTPS working)
- [ ] Firewall enabled (UFW)
- [ ] MongoDB bound to localhost only
- [ ] MongoDB authentication enabled
- [ ] Regular backups configured (see below)

---

## Backup Script

Create `/var/www/bms/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/www/bms/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb://bmsAppUser:YOUR_PASSWORD@127.0.0.1:27017/eti_educom_prod?authSource=eti_educom_prod" --out="$BACKUP_DIR/mongo_$DATE"

# Compress
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" "$BACKUP_DIR/mongo_$DATE"
rm -rf "$BACKUP_DIR/mongo_$DATE"

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.tar.gz"
```

Add to crontab for daily backups:
```bash
chmod +x /var/www/bms/backup.sh
crontab -e
# Add: 0 2 * * * /var/www/bms/backup.sh
```

---

## Updating the Application

```bash
cd /var/www/bms

# Pull latest code (if using git)
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart bms-backend

# Update frontend
cd ../frontend
yarn install
yarn build

# Restart nginx (if config changed)
sudo systemctl restart nginx
```

---

## Troubleshooting

**Backend not starting:**
```bash
pm2 logs bms-backend --lines 50
```

**502 Bad Gateway:**
- Check if backend is running: `pm2 status`
- Check backend logs: `pm2 logs bms-backend`

**SSL Certificate renewal:**
```bash
sudo certbot renew --dry-run
```

**MongoDB connection issues:**
```bash
mongosh "mongodb://bmsAppUser:PASSWORD@127.0.0.1:27017/eti_educom_prod?authSource=eti_educom_prod"
```

---

## Support

For issues, check:
1. Backend logs: `pm2 logs bms-backend`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`
