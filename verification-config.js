const verificationConfig = {
    allowedBusinessTypes: [
        'Corporation',
        'LLC',
        'Sole Proprietorship',
        'Partnership',
        'Non-Profit'
    ],
    
    requiredDocuments: [
        {
            type: 'businessLicense',
            label: 'Business License',
            required: true,
            format: ['pdf', 'jpg', 'png'],
            maxSize: 5000000 // 5MB
        },
        {
            type: 'taxId',
            label: 'Tax ID Documentation',
            required: true,
            format: ['pdf'],
            maxSize: 2000000 // 2MB
        },
        {
            type: 'identityProof',
            label: 'Government ID',
            required: true,
            format: ['jpg', 'png'],
            maxSize: 3000000 // 3MB
        }
    ],
    
    verificationProcess: {
        estimatedTime: '2-3 business days',
        autoExpiry: 365, // days
        renewalReminder: 30 // days before expiry
    }
};

export default verificationConfig;
