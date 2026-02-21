# ETI Educom - Hostinger VPS Deployment Guide

## Complete Step-by-Step Guide for Hostinger VPS

---

## PART 1: HOSTINGER VPS SETUP

### 1.1 Purchase & Access VPS

1. Go to [Hostinger VPS](https://www.hostinger.com/vps-hosting)
2. Choose **KVM 2** or higher (recommended: 4GB RAM)
3. Select **Ubuntu 22.04** as the operating system
4. Complete purchase

### 1.2 Get VPS Credentials

After purchase, go to **hPanel → VPS → Manage**

You'll find:
- **IP Address**: e.g., `154.41.xx.xx`
- **Username**: `root`
- **Password**: (set during purchase or reset in panel)

### 1.3 Connect via SSH

**Windows (using PowerShell or PuTTY):**
```bash
ssh root@YOUR_VPS_IP
```

**Mac/Linux:**
```bash
ssh root@YOUR_VPS_IP
```

Enter your password when prompted.

---

## PART 2: SERVER PREPARATION

### 2.1 Update System & Install Basic Tools

```bash
# Update package list
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git unzip nano ufw software-properties-common
```

### 2.2 Create Non-Root User (Security Best Practice)

```bash
# Create user
adduser etiadmin

# Add to sudo group
usermod -aG sudo etiadmin

# Switch to new user (optional, can continue as root)
# su - etiadmin
```

### 2.3 Configure Firewall

```bash
# Allow SSH
ufw allow 22

# Allow HTTP & HTTPS
ufw allow 80
ufw allow 443

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## PART 3: INSTALL DEPENDENCIES

### 3.1 Install Node.js 18

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# Install Node.js
apt install -y nodejs

# Verify installation
node --version   # Should show v18.x.x
npm --version    # Should show 9.x.x or higher
```

### 3.2 Install Python 3.11

```bash
# Add deadsnakes PPA for latest Python
add-apt-repository ppa:deadsnakes/ppa -y
apt update

# Install Python 3.11
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Set as default (optional)
update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

# Verify
python3.11 --version
```

### 3.3 Install MongoDB 7.0

```bash
# Import MongoDB GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Verify MongoDB is running
systemctl status mongod
```

### 3.4 Install Nginx

```bash
apt install -y nginx

# Start and enable
systemctl start nginx
systemctl enable nginx

# Verify
systemctl status nginx
```

### 3.5 Install PM2 (Process Manager)

```bash
npm install -g pm2
```

---

## PART 4: DEPLOY APPLICATION

### 4.1 Create Directory Structure

```bash
# Create application directory
mkdir -p /var/www/etieducom
cd /var/www/etieducom
```

### 4.2 Option A: Clone from GitHub

If you saved code to GitHub:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

### 4.2 Option B: Upload via SFTP

Use FileZilla or WinSCP:
- **Host**: Your VPS IP
- **Username**: root
- **Password**: Your VPS password
- **Port**: 22

Upload the `backend` and `frontend` folders to `/var/www/etieducom/`

### 4.3 Verify Directory Structure

```bash
ls -la /var/www/etieducom/
```

Should show:
```
/var/www/etieducom/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── .env
```

---

## PART 5: CONFIGURE BACKEND

### 5.1 Setup Python Virtual Environment

```bash
cd /var/www/etieducom/backend

# Create virtual environment
python3.11 -m venv venv

# Activate it
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### 5.2 Install Python Dependencies

```bash
# Install all requirements
pip install -r requirements.txt

# If there are issues, install manually:
pip install fastapi uvicorn motor python-jose passlib python-dotenv pydantic httpx python-multipart bcrypt
```

### 5.3 Create Production .env File

```bash
nano /var/www/etieducom/backend/.env
```

Add the following (edit values as needed):

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=etieducom_production
SECRET_KEY=generate-a-64-character-random-string-here
MSG91_AUTH_KEY=354230AManBGHBNB694046f8P1
```

**Generate a secure SECRET_KEY:**
```bash
openssl rand -hex 32
```

### 5.4 Test Backend Manually

```bash
cd /var/www/etieducom/backend
source venv/bin/activate

# Test run
uvicorn server:app --host 0.0.0.0 --port 8001

# You should see:
# INFO:     Uvicorn running on http://0.0.0.0:8001
# INFO:     Application startup complete.

# Press Ctrl+C to stop
```

### 5.5 Create PM2 Configuration

```bash
nano /var/www/etieducom/ecosystem.config.js
```

Add:

```javascript
module.exports = {
  apps: [{
    name: 'etieducom-api',
    cwd: '/var/www/etieducom/backend',
    script: '/var/www/etieducom/backend/venv/bin/uvicorn',
    args: 'server:app --host 127.0.0.1 --port 8001',
    interpreter: 'none',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### 5.6 Start Backend with PM2

```bash
cd /var/www/etieducom

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Copy and run the command it outputs
```

### 5.7 Verify Backend is Running

```bash
pm2 status
pm2 logs etieducom-api
```

---

## PART 6: CONFIGURE FRONTEND

### 6.1 Create Production .env

```bash
nano /var/www/etieducom/frontend/.env
```

Add (replace with your actual domain):

```env
REACT_APP_BACKEND_URL=https://yourdomain.com
```

### 6.2 Install Dependencies

```bash
cd /var/www/etieducom/frontend

# Install packages
npm install
```

### 6.3 Build Production Bundle

```bash
npm run build
```

This creates a `build/` folder with optimized static files.

### 6.4 Verify Build

```bash
ls -la /var/www/etieducom/frontend/build/
```

Should contain `index.html`, `static/` folder, etc.

---

## PART 7: CONFIGURE NGINX

### 7.1 Create Nginx Configuration

```bash
nano /etc/nginx/sites-available/etieducom
```

Add the following (replace `yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://$server_name$request_uri;

    # Root directory for React build
    root /var/www/etieducom/frontend/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Frontend routes - serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # File upload size limit (for photos)
    client_max_body_size 10M;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7.2 Enable the Site

```bash
# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Create symlink to enable our site
ln -s /etc/nginx/sites-available/etieducom /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# If test passes, reload Nginx
systemctl reload nginx
```

---

## PART 8: DOMAIN CONFIGURATION (HOSTINGER)

### 8.1 Point Domain to VPS

1. Go to **Hostinger hPanel**
2. Navigate to **Domains → Manage**
3. Go to **DNS / Nameservers → DNS Records**
4. Add/Edit these records:

| Type | Name | Points to | TTL |
|------|------|-----------|-----|
| A | @ | YOUR_VPS_IP | 3600 |
| A | www | YOUR_VPS_IP | 3600 |

### 8.2 Wait for DNS Propagation

DNS changes can take 5 minutes to 48 hours. Check with:

```bash
# From your local machine
nslookup yourdomain.com
ping yourdomain.com
```

---

## PART 9: SSL CERTIFICATE (HTTPS)

### 9.1 Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 9.2 Get SSL Certificate

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter email address
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 9.3 Verify Auto-Renewal

```bash
# Test renewal
certbot renew --dry-run

# Certbot automatically adds a cron job for renewal
```

---

## PART 10: INITIALIZE DATABASE

### 10.1 Create Super Admin

```bash
cd /var/www/etieducom/backend
source venv/bin/activate

python3 << 'EOF'
from pymongo import MongoClient
import uuid
from datetime import datetime, timezone
from passlib.context import CryptContext

client = MongoClient("mongodb://localhost:27017")
db = client["etieducom_production"]

# Create password hash
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed_password = pwd_context.hash("admin@123")

# Create Super Admin
super_admin = {
    "id": str(uuid.uuid4()),
    "email": "admin@etieducom.com",
    "hashed_password": hashed_password,
    "name": "Super Admin",
    "role": "Admin",
    "branch_id": None,
    "is_active": True,
    "created_at": datetime.now(timezone.utc).isoformat()
}

# Check if user exists
existing = db.users.find_one({"email": "admin@etieducom.com"})
if not existing:
    db.users.insert_one(super_admin)
    print("✅ Super Admin created!")
    print("   Email: admin@etieducom.com")
    print("   Password: admin@123")
else:
    print("ℹ️  Super Admin already exists")
EOF
```

---

## PART 11: FINAL VERIFICATION

### 11.1 Check All Services

```bash
# Check MongoDB
systemctl status mongod

# Check PM2/Backend
pm2 status

# Check Nginx
systemctl status nginx
```

### 11.2 Test the Application

1. Open browser: `https://yourdomain.com`
2. You should see the ETI Educom login page
3. Login with:
   - **Email**: `admin@etieducom.com`
   - **Password**: `admin@123`

### 11.3 Check Logs if Issues

```bash
# Backend logs
pm2 logs etieducom-api

# Nginx error logs
tail -f /var/log/nginx/error.log

# Nginx access logs
tail -f /var/log/nginx/access.log
```

---

## PART 12: USEFUL COMMANDS

### Application Management

```bash
# Restart backend
pm2 restart etieducom-api

# Stop backend
pm2 stop etieducom-api

# View logs
pm2 logs etieducom-api --lines 100

# Monitor resources
pm2 monit
```

### Server Management

```bash
# Restart Nginx
systemctl restart nginx

# Restart MongoDB
systemctl restart mongod

# Check disk space
df -h

# Check memory usage
free -m

# Check running processes
htop
```

### Update Application

```bash
cd /var/www/etieducom

# If using Git
git pull origin main

# Rebuild frontend
cd frontend
npm install
npm run build

# Restart backend
pm2 restart etieducom-api

# Reload Nginx (if config changed)
systemctl reload nginx
```

---

## TROUBLESHOOTING

### Issue: "502 Bad Gateway"
```bash
# Check if backend is running
pm2 status
pm2 logs etieducom-api

# Restart backend
pm2 restart etieducom-api
```

### Issue: "Connection Refused"
```bash
# Check MongoDB
systemctl status mongod
systemctl start mongod
```

### Issue: SSL Certificate Error
```bash
# Renew certificate
certbot renew

# Check certificate status
certbot certificates
```

### Issue: "Permission Denied"
```bash
# Fix ownership
chown -R www-data:www-data /var/www/etieducom/frontend/build
chmod -R 755 /var/www/etieducom
```

---

## SECURITY RECOMMENDATIONS

1. **Change default SSH port**:
   ```bash
   nano /etc/ssh/sshd_config
   # Change: Port 22 → Port 2222
   systemctl restart sshd
   ufw allow 2222
   ```

2. **Disable root login**:
   ```bash
   nano /etc/ssh/sshd_config
   # Set: PermitRootLogin no
   ```

3. **Setup fail2ban**:
   ```bash
   apt install fail2ban
   systemctl enable fail2ban
   ```

4. **Regular backups**:
   ```bash
   # Backup MongoDB
   mongodump --out /backup/mongodb/$(date +%Y%m%d)
   ```

---

## SUPPORT

If you face any issues:
1. Check the logs first (PM2, Nginx, MongoDB)
2. Verify all services are running
3. Check firewall rules
4. Verify DNS is pointing correctly

---

**Your ETI Educom Branch Management System is now live!** 🎉

Login: https://yourdomain.com
Email: admin@etieducom.com
Password: admin@123
