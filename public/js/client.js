const serializeForm = (form) => {
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
};

const displayStatus = (element, message, isSuccess) => {
    element.textContent = message;
    if (isSuccess) {
        element.className = 'text-center p-3 mt-4 text-sm font-medium text-green-700 bg-green-100 rounded-md';
    } else {
        element.className = 'text-center p-3 mt-4 text-sm font-medium text-red-700 bg-red-100 rounded-md';
    }
};

const handleLogout = async () => { // 💡 ADDED THE MISSING LOGOUT FUNCTION
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'include', // Necessary to send the cookie to be cleared
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log(result.message);
            
            // 💡 Use location.replace to prevent going back to the authenticated page
            window.location.replace("/");
        } else {
            alert(`Logout failed: ${result.message || 'Server error.'}`);
        }
    } catch (error) {
        console.error('Network error during logout:', error);
        alert('A network error prevented logout. Please try again.');
    }
};
const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = serializeForm(form);
    const formAction = form.getAttribute('action');

const statusContainer = form.querySelector('#status-message') || document.getElementById('status-message') || document.createElement('div');
if (!form.querySelector('#status-message')) {
    form.insertBefore(statusContainer, form.firstChild);
    statusContainer.id = 'status-message';
}
displayStatus(statusContainer, 'Processing...', false);

try {
    const response = await fetch(formAction, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
    });
    const result = await response.json();
    const isSuccess = response.ok && result.success;
    if (isSuccess) {
        displayStatus(statusContainer, result.message, true);
        if (result.accessToken) {
            console.log("Token recieved{simulated storage)");
        }
         if (result.redirectUrl) {
                setTimeout(() => {
                    window.location.replace( result.redirectUrl);
                    // fetchCurrentAvailability();
                }, 1500); 
    }
}
    else{
       displayStatus(statusContainer, `Error: ${result.message || 'Operation failed.'}`, false);  
    }
}
catch (error) {
    console.error('Network or critical server error:', error);
        displayStatus(statusContainer, 'A critical network error occurred.', false);
    }
};


document.addEventListener('DOMContentLoaded', () => {
    // 1. Patient Registration Form (Action: /patient/register-done)
    const patientRegForm = document.querySelector('form[action="/patient/register-done"]');
    if (patientRegForm) {
        patientRegForm.addEventListener('submit', handleSubmit);
    }
      const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    // 2. User Login Form (Action: /login)
    const userLoginForm = document.querySelector('form[action="/login"]');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', handleSubmit);
    }

    // 3. User Sign Up Form (Action: /SignUp-succesful)
    const userSignupForm = document.querySelector('form[action="/SignUp-succesful"]');
    if (userSignupForm) {
        userSignupForm.addEventListener('submit', handleSubmit);
    }
    const doctorRegForm = document.querySelector('form[action="/doctor-register-form"]');
    if (doctorRegForm) {
        doctorRegForm.addEventListener('submit', handleSubmit);
        console.log("Listener attached to Doctor Registration Form.");
    }
    
    // 4. Doctor Login Form (Action: /doctor-login)
    const doctorLoginForm = document.querySelector('form[action="/doctor-login"]');
    if (doctorLoginForm) {
        doctorLoginForm.addEventListener('submit', handleSubmit);
    }
    const patientLoginForm = document.querySelector('form[action="/patient-home"]');
if (patientLoginForm) {
    patientLoginForm.addEventListener('submit', handleSubmit);
}
 const doctorAvailabilityForm = document.querySelector('form[action="/api/doctor/availability"]');
    if (doctorAvailabilityForm) {
        doctorAvailabilityForm.addEventListener('submit', handleSubmit);
    }
});