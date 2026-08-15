export type Role = 'EMPLOYEE' | 'ADMIN';
export type LeaveType =
  | 'CASUAL'
  | 'SICK'
  | 'EARNED'
  | 'PARENTAL'
  | 'SECONDARY_PARENTAL'
  | 'SPECIAL_MEDICAL'
  | 'MENSTRUAL'
  | 'ADOPTION'
  | 'CHARITABLE'
  | 'UNPAID';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export const Role = {
  EMPLOYEE: 'EMPLOYEE' as Role,
  ADMIN: 'ADMIN' as Role,
};

export const LeaveType = {
  CASUAL: 'CASUAL' as LeaveType,
  SICK: 'SICK' as LeaveType,
  EARNED: 'EARNED' as LeaveType,
  PARENTAL: 'PARENTAL' as LeaveType,
  SECONDARY_PARENTAL: 'SECONDARY_PARENTAL' as LeaveType,
  SPECIAL_MEDICAL: 'SPECIAL_MEDICAL' as LeaveType,
  MENSTRUAL: 'MENSTRUAL' as LeaveType,
  ADOPTION: 'ADOPTION' as LeaveType,
  CHARITABLE: 'CHARITABLE' as LeaveType,
  UNPAID: 'UNPAID' as LeaveType,
};

export const LeaveStatus = {
  PENDING: 'PENDING' as LeaveStatus,
  APPROVED: 'APPROVED' as LeaveStatus,
  REJECTED: 'REJECTED' as LeaveStatus,
  CANCELLED: 'CANCELLED' as LeaveStatus,
};
