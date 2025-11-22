import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { resolveAdminLocation, resolveUserDashboardLocation } from './adminRoutes.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Elements
  const form = document.getElementById('change-password-form');
  const newPassword = document.getElementById('new-password');
  const confirmPassword = document.getElementById('confirm-password');
  const submitBtn = document.getElementById('submit-btn');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');

  const initializePasswordToggles = () => {
    const toggleButtons = document.querySelectorAll('[data-password-toggle]');
    if (!toggleButtons.length) {
      return;
    }

    toggleButtons.forEach((button) => {
      const targetId = button.dataset.target;
      if (!targetId) {
        return;
      }

      const targetInput = document.getElementById(targetId);
      if (!targetInput) {
        return;
      }

      const setVisibility = (isVisible) => {
        targetInput.type = isVisible ? 'text' : 'password';
        button.classList.toggle('is-visible', isVisible);
        button.setAttribute('aria-pressed', String(isVisible));
        button.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
      };

      button.addEventListener('click', () => {
        const isCurrentlyVisible = targetInput.type === 'text';
        setVisibility(!isCurrentlyVisible);
        targetInput.focus({ preventScroll: true });
        targetInput.setSelectionRange(targetInput.value.length, targetInput.value.length);
      });

      setVisibility(targetInput.type === 'text');
    });
  };

  initializePasswordToggles();

  // Password requirement elements
  const reqLength = document.getElementById('req-length');
  const reqUppercase = document.getElementById('req-uppercase');
  const reqLowercase = document.getElementById('req-lowercase');
  const reqNumber = document.getElementById('req-number');
  const reqSpecial = document.getElementById('req-special');

  // Real-time password validation
  newPassword.addEventListener('input', () => {
    const password = newPassword.value;

    // Check length
    if (password.length >= 8) {
      reqLength.classList.remove('invalid');
      reqLength.classList.add('valid');
    } else {
      reqLength.classList.remove('valid');
      reqLength.classList.add('invalid');
    }

    // Check uppercase
    if (/[A-Z]/.test(password)) {
      reqUppercase.classList.remove('invalid');
      reqUppercase.classList.add('valid');
    } else {
      reqUppercase.classList.remove('valid');
      reqUppercase.classList.add('invalid');
    }

    // Check lowercase
    if (/[a-z]/.test(password)) {
      reqLowercase.classList.remove('invalid');
      reqLowercase.classList.add('valid');
    } else {
      reqLowercase.classList.remove('valid');
      reqLowercase.classList.add('invalid');
    }

    // Check number
    if (/[0-9]/.test(password)) {
      reqNumber.classList.remove('invalid');
      reqNumber.classList.add('valid');
    } else {
      reqNumber.classList.remove('valid');
      reqNumber.classList.add('invalid');
    }

    // Check special character
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      reqSpecial.classList.remove('invalid');
      reqSpecial.classList.add('valid');
    } else {
      reqSpecial.classList.remove('valid');
      reqSpecial.classList.add('invalid');
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorMessage.textContent = '';
    successMessage.textContent = '';

    const newPass = newPassword.value.trim();
    const confirmPass = confirmPassword.value.trim();

    // Validation
    if (!newPass || !confirmPass) {
      errorMessage.textContent = 'Please fill in all fields.';
      return;
    }

    if (newPass.length < 8) {
      errorMessage.textContent = 'Password must be at least 8 characters.';
      return;
    }

    if (!/[A-Z]/.test(newPass)) {
      errorMessage.textContent = 'Password must contain at least one uppercase letter.';
      return;
    }

    if (!/[a-z]/.test(newPass)) {
      errorMessage.textContent = 'Password must contain at least one lowercase letter.';
      return;
    }

    if (!/[0-9]/.test(newPass)) {
      errorMessage.textContent = 'Password must contain at least one number.';
      return;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPass)) {
      errorMessage.textContent = 'Password must contain at least one special character.';
      return;
    }

    if (newPass !== confirmPass) {
      errorMessage.textContent = 'New passwords do not match.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Changing Password...';

    try {
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPass
      });

      if (updateError) {
        errorMessage.textContent = updateError.message;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Change Password';
        return;
      }

      // Update needs_password_change flag in users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ needs_password_change: false })
        .eq('auth_user_id', user.id);

      if (dbError) {
        console.error('Error updating password change flag:', dbError);
      }

      successMessage.textContent = 'Password changed successfully! Redirecting...';
      
      // Redirect based on role
      setTimeout(async () => {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('auth_user_id', user.id)
          .single();

        if (userData?.role === 'admin') {
          window.location.href = resolveAdminLocation();
        } else {
          window.location.href = resolveUserDashboardLocation();
        }
      }, 2000);

    } catch (err) {
      console.error('Error changing password:', err);
      errorMessage.textContent = 'An error occurred. Please try again.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Change Password';
    }
  });
});
