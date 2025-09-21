function checkStrongPassword(password) {
  const errors = [];
  if (password.length < 6) errors.push("Password too short");
  if (!/[A-Z]/.test(password)) errors.push("Missing uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Missing lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Missing number");
  if (!/[@$!%*?&]/.test(password)) errors.push("Missing special character");

  return {
    isStrong: errors.length === 0,
    errors
  };
}
