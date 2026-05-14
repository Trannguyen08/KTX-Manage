export const VN_PHONE_PATTERN = "^(0|\\+84)(3|5|7|8|9)[0-9]{8}$";
export const VN_IDENTITY_PATTERN = "^([0-9]{9}|[0-9]{12})$";
export const STUDENT_CODE_PATTERN = "^[A-Za-z0-9._-]{4,30}$";

export function adultMaxBirthDate(minAge = 18) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minAge);
  return date.toISOString().slice(0, 10);
}

export function isAdultBirthDate(value, minAge = 18) {
  if (!value) return true;
  return value <= adultMaxBirthDate(minAge);
}

export function isValidPattern(value, pattern) {
  if (!value) return true;
  return new RegExp(pattern).test(String(value).trim());
}

export function validateRegistrationForm(form) {
  if (!isAdultBirthDate(form.date_of_birth)) {
    return "Ngày sinh phải đủ từ 18 tuổi trở lên.";
  }
  if (!isValidPattern(form.identity_number, VN_IDENTITY_PATTERN)) {
    return "CMND/CCCD phải gồm 9 hoặc 12 chữ số.";
  }
  if (!isValidPattern(form.phone, VN_PHONE_PATTERN)) {
    return "Số điện thoại cá nhân không đúng định dạng Việt Nam.";
  }
  if (form.guardian_phone && !isValidPattern(form.guardian_phone, VN_PHONE_PATTERN)) {
    return "Số điện thoại người thân không đúng định dạng Việt Nam.";
  }
  if (!isValidPattern(form.student_code, STUDENT_CODE_PATTERN)) {
    return "MSSV chỉ được chứa chữ, số, dấu chấm, gạch dưới hoặc gạch ngang, dài 4-30 ký tự.";
  }
  return "";
}

export function blockInvalidNumberKey(event) {
  if (["e", "E", "+", "-"].includes(event.key)) {
    event.preventDefault();
  }
}

export function normalizeSearchText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export function includesSearch(value, keyword) {
  return normalizeSearchText(value).includes(normalizeSearchText(keyword));
}
