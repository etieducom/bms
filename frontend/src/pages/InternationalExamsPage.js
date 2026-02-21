import React, { useState, useEffect } from 'react';
import { examsAPI } from '@/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, GraduationCap, Phone, Mail, Calendar } from 'lucide-react';

const InternationalExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    student_name: '',
    student_phone: '',
    student_email: '',
    exam_id: '',
    exam_date: '',
    notes: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await examsAPI.getTypes();
      setExams(response.data);
    } catch (error) {
      toast.error('Failed to fetch exam types');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.exam_id) {
      toast.error('Please select an exam');
      return;
    }

    try {
      await examsAPI.createBooking(formData);
      toast.success('Exam booking created successfully!');
      setBookingDialog(false);
      setFormData({
        student_name: '',
        student_phone: '',
        student_email: '',
        exam_id: '',
        exam_date: '',
        notes: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create booking');
    }
  };

  const selectedExam = exams.find(e => e.id === formData.exam_id);

  return (
    <div className="space-y-6" data-testid="international-exams-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">International Exams</h1>
          <p className="text-slate-600">Book international exams for students</p>
        </div>
        <Button 
          onClick={() => setBookingDialog(true)} 
          className="bg-slate-900 hover:bg-slate-800"
          data-testid="new-booking-btn"
        >
          <Plus className="w-4 h-4 mr-2" /> New Booking
        </Button>
      </div>

      {/* Available Exams */}
      <Card className="border-slate-200 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Available Exams
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : exams.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No exams available. Please contact Super Admin to add exam types.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map((exam) => (
                <Card key={exam.id} className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-lg">{exam.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{exam.description || 'No description'}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-bold text-green-600">₹{exam.price?.toLocaleString()}</span>
                      <Button
                        size="sm"
                        onClick={() => {
                          setFormData({ ...formData, exam_id: exam.id });
                          setBookingDialog(true);
                        }}
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Book International Exam</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Exam *</Label>
              <Select value={formData.exam_id} onValueChange={(v) => setFormData({ ...formData, exam_id: v })}>
                <SelectTrigger data-testid="exam-select">
                  <SelectValue placeholder="Choose an exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name} - ₹{exam.price?.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedExam && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>{selectedExam.name}</strong> - ₹{selectedExam.price?.toLocaleString()}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Student Name *</Label>
              <Input
                value={formData.student_name}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                placeholder="Enter student name"
                required
                data-testid="student-name-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  value={formData.student_phone}
                  onChange={(e) => setFormData({ ...formData, student_phone: e.target.value })}
                  placeholder="Phone number"
                  required
                  data-testid="student-phone-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.student_email}
                  onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                  placeholder="Email address"
                  data-testid="student-email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Exam Date</Label>
              <Input
                type="date"
                value={formData.exam_date}
                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                data-testid="exam-date-input"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                className="w-full min-h-20 px-3 py-2 border border-slate-200 rounded-md text-sm"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setBookingDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                Create Booking
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InternationalExamsPage;
