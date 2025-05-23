import Employee from '../models/Employee.js';
import OnboardingForm from '../models/OnboardingForm.js';

export const getOnboardingProgress = async (req, res) => {
  try {
    console.log('Fetching onboarding progress...');
    
    // Get all employees
    const employees = await Employee.find();
    console.log(`Found ${employees.length} employees`);
    
    // Get all forms
    const forms = await OnboardingForm.find();
    console.log(`Found ${forms.length} forms`);
    
    // Calculate progress for each employee
    const progressData = employees.map(employee => {
      try {
        // Find forms assigned to this employee
        const employeeForms = forms.filter(form => 
          form.recipients && form.recipients.some(r => r.email === employee.email)
        );
        
        let notStarted = 0;
        let inProgress = 0;
        let completed = 0;
        
        employeeForms.forEach(form => {
          const recipient = form.recipients.find(r => r.email === employee.email);
          if (!recipient) {
            notStarted++;
          } else if (recipient.completedAt) {
            completed++;
          } else if (recipient.completedFields) {
            inProgress++;
          } else {
            notStarted++;
          }
        });
        
        const totalForms = employeeForms.length;
        const progress = totalForms > 0 ? Math.round((completed / totalForms) * 100) : 0;
        
        let status = 'Not Started';
        if (progress === 100) {
          status = 'Complete';
        } else if (progress > 0) {
          status = 'In Progress';
        }
        
        return {
          employeeId: employee._id,
          status,
          progress,
          completed,
          totalForms,
          notStarted,
          inProgress
        };
      } catch (employeeError) {
        console.error(`Error processing employee ${employee._id}:`, employeeError);
        return {
          employeeId: employee._id,
          status: 'Error',
          progress: 0,
          completed: 0,
          totalForms: 0,
          notStarted: 0,
          inProgress: 0,
          error: employeeError.message
        };
      }
    });
    
    console.log('Successfully calculated progress for all employees');
    res.json(progressData);
  } catch (error) {
    console.error('Error in getOnboardingProgress:', error);
    res.status(500).json({ 
      message: 'Error fetching onboarding progress',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 