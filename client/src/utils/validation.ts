/**
 * Validation Utilities for Pass Sharing Feature
 * Provides comprehensive client-side validation
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface BatchEmailValidationResult extends ValidationResult {
  validEmails?: string[];
  invalidEmails?: string[];
}

export const validationUtils = {
  /**
   * Validate email format
   */
  email: (email: string): ValidationResult => {
    if (!email || !email.trim()) {
      return { valid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { valid: false, error: 'Invalid email format (e.g., user@example.com)' };
    }

    // Check email length
    if (email.length > 254) {
      return { valid: false, error: 'Email is too long (max 254 characters)' };
    }

    // Check for blocked domains (spam/temporary email services)
    const blockedDomains = [
      'tempmail.com',
      'throwaway.email',
      'guerrillamail.com',
      '10minutemail.com',
      'mailinator.com'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && blockedDomains.includes(domain)) {
      return { valid: false, error: 'Temporary email addresses are not allowed' };
    }

    return { valid: true };
  },

  /**
   * Validate recipient name
   */
  recipientName: (name: string): ValidationResult => {
    if (!name || !name.trim()) {
      return { valid: true }; // Name is optional
    }

    if (name.trim().length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters' };
    }

    if (name.length > 100) {
      return { valid: false, error: 'Name must be less than 100 characters' };
    }

    // Allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name)) {
      return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }

    return { valid: true };
  },

  /**
   * Validate expiry days
   */
  expiryDays: (days: number | string): ValidationResult => {
    const numDays = typeof days === 'string' ? parseInt(days) : days;

    if (isNaN(numDays)) {
      return { valid: false, error: 'Expiry days must be a number' };
    }

    if (numDays < 1) {
      return { valid: false, error: 'Expiry must be at least 1 day' };
    }

    if (numDays > 365) {
      return { valid: false, error: 'Expiry cannot exceed 365 days' };
    }

    return { valid: true };
  },

  /**
   * Validate template name
   */
  templateName: (name: string): ValidationResult => {
    if (!name || !name.trim()) {
      return { valid: false, error: 'Template name is required' };
    }

    if (name.trim().length < 3) {
      return { valid: false, error: 'Template name must be at least 3 characters' };
    }

    if (name.length > 50) {
      return { valid: false, error: 'Template name must be less than 50 characters' };
    }

    // Allow letters, numbers, spaces, hyphens, and underscores
    const nameRegex = /^[a-zA-Z0-9\s_-]+$/;
    if (!nameRegex.test(name)) {
      return { valid: false, error: 'Template name can only contain letters, numbers, spaces, hyphens, and underscores' };
    }

    return { valid: true };
  },

  /**
   * Validate batch emails
   */
  batchEmails: (emailsText: string): BatchEmailValidationResult => {
    if (!emailsText || !emailsText.trim()) {
      return { valid: false, error: 'At least one email is required' };
    }

    const emailList = emailsText
      .split('\n')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    if (emailList.length === 0) {
      return { valid: false, error: 'At least one email is required' };
    }

    if (emailList.length > 50) {
      return { valid: false, error: 'Maximum 50 emails allowed at once' };
    }

    // Check for duplicate emails
    const uniqueEmails = new Set(emailList.map(e => e.toLowerCase()));
    if (uniqueEmails.size !== emailList.length) {
      return { valid: false, error: 'Duplicate emails found in the list' };
    }

    // Validate each email
    const invalidEmails: string[] = [];
    const validEmails: string[] = [];

    emailList.forEach(email => {
      const validation = validationUtils.email(email);
      if (validation.valid) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    });

    if (invalidEmails.length > 0) {
      const displayInvalid = invalidEmails.slice(0, 3).join(', ');
      const more = invalidEmails.length > 3 ? ` and ${invalidEmails.length - 3} more` : '';
      return {
        valid: false,
        error: `Invalid emails found: ${displayInvalid}${more}`,
        invalidEmails
      };
    }

    return { valid: true, validEmails };
  },

  /**
   * Validate message length
   */
  message: (message: string): ValidationResult => {
    if (!message || !message.trim()) {
      return { valid: true }; // Message is optional
    }

    if (message.length > 500) {
      return { valid: false, error: 'Message must be less than 500 characters' };
    }

    return { valid: true };
  },

  /**
   * Validate pass selection
   */
  passSelection: (passId: string, availablePasses: any[]): ValidationResult => {
    if (!passId || !passId.trim()) {
      return { valid: false, error: 'Please select a pass to share' };
    }

    const passExists = availablePasses.some(p => p._id === passId);
    if (!passExists) {
      return { valid: false, error: 'Selected pass not found. Please refresh and try again.' };
    }

    return { valid: true };
  },

  /**
   * Validate restrictions array
   */
  restrictions: (restrictions: string[]): ValidationResult => {
    const validRestrictions = ['no-download', 'no-print', 'no-share', 'no-export', 'view-only'];
    
    if (!Array.isArray(restrictions)) {
      return { valid: false, error: 'Restrictions must be an array' };
    }

    const invalidRestrictions = restrictions.filter(r => !validRestrictions.includes(r));
    if (invalidRestrictions.length > 0) {
      return { valid: false, error: `Invalid restrictions: ${invalidRestrictions.join(', ')}` };
    }

    // Check conflicting restrictions
    if (restrictions.includes('view-only') && restrictions.length > 1) {
      return { valid: false, error: '"View Only" restriction cannot be combined with other restrictions' };
    }

    return { valid: true };
  },

  /**
   * Validate complete share form
   */
  shareForm: (form: {
    passId: string;
    recipientEmail: string;
    recipientName?: string;
    expiryDays: number;
    message?: string;
  }, availablePasses: any[]): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    // Validate pass selection
    const passValidation = validationUtils.passSelection(form.passId, availablePasses);
    if (!passValidation.valid) {
      errors.passId = passValidation.error!;
    }

    // Validate email
    const emailValidation = validationUtils.email(form.recipientEmail);
    if (!emailValidation.valid) {
      errors.recipientEmail = emailValidation.error!;
    }

    // Validate name (if provided)
    if (form.recipientName) {
      const nameValidation = validationUtils.recipientName(form.recipientName);
      if (!nameValidation.valid) {
        errors.recipientName = nameValidation.error!;
      }
    }

    // Validate expiry days
    const expiryValidation = validationUtils.expiryDays(form.expiryDays);
    if (!expiryValidation.valid) {
      errors.expiryDays = expiryValidation.error!;
    }

    // Validate message (if provided)
    if (form.message) {
      const messageValidation = validationUtils.message(form.message);
      if (!messageValidation.valid) {
        errors.message = messageValidation.error!;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validate complete template form
   */
  templateForm: (form: {
    name: string;
    expiryDays: number;
    restrictions: string[];
  }): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    // Validate template name
    const nameValidation = validationUtils.templateName(form.name);
    if (!nameValidation.valid) {
      errors.name = nameValidation.error!;
    }

    // Validate expiry days
    const expiryValidation = validationUtils.expiryDays(form.expiryDays);
    if (!expiryValidation.valid) {
      errors.expiryDays = expiryValidation.error!;
    }

    // Validate restrictions
    const restrictionsValidation = validationUtils.restrictions(form.restrictions);
    if (!restrictionsValidation.valid) {
      errors.restrictions = restrictionsValidation.error!;
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
};

/**
 * Helper function to get validation class names for inputs
 */
export const getValidationClassName = (
  hasError: boolean,
  baseClasses: string = 'w-full p-2.5 border rounded-lg focus:ring-2 shadow-sm transition-all'
): string => {
  if (hasError) {
    return `${baseClasses} border-rose-500 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30`;
  }
  return `${baseClasses} border-slate-300 focus:ring-indigo-500 focus:border-indigo-500`;
};
