// Sheet layout. Google Sheets is the only database: two tabs, one row per record.
// The FIRST header of each tab is its stable ID column.

export const TABS = { TENANTS: 'Tenants', PAYMENTS: 'Rent Payments' };

export const HEADERS = {
  'Tenants': [
    'Unit ID', 'Building ID', 'Building Name', 'Building Address',
    'Unit Number', 'Occupancy Status',
    'First Name', 'Last Name', 'Joining Date', 'Contact', 'NID Number',
    'Electricity Meter ID',
    'Base Rent', 'Water Bill', 'Gas Bill', 'Service Charge',
    'Created', 'Updated', 'Archived',
  ],
  'Rent Payments': [
    'Payment ID', 'Building ID', 'Building Name',
    'Unit ID', 'Unit Number',
    'Amount Received', 'Date Received',
    'Created', 'Updated', 'Archived',
  ],
};

export const ID_PREFIX = { 'Tenants': 'U', 'Rent Payments': 'P', 'Building': 'B' };

// Wiped when a unit becomes Empty
export const TENANT_FIELDS = [
  'First Name', 'Last Name', 'Joining Date', 'Contact', 'NID Number',
  'Electricity Meter ID', 'Base Rent', 'Water Bill', 'Gas Bill', 'Service Charge',
];

// Zero allowed, negative not allowed
export const CHARGE_FIELDS = ['Base Rent', 'Water Bill', 'Gas Bill', 'Service Charge'];
