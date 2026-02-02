import { generateEvidenceChecklist } from '../src/services/evidenceService';

describe('Evidence Service', () => {
    test('should return null for missing claim type', () => {
        const result = generateEvidenceChecklist({});
        expect(result).toBeNull();
    });
    
    test('should generate checklist for unpaid_debt claim', () => {
        const caseData = { claimType: 'unpaid_debt' };
        const result = generateEvidenceChecklist(caseData);
        
        expect(result).not.toBeNull();
        expect(result.critical).toBeInstanceOf(Array);
        expect(result.important).toBeInstanceOf(Array);
        expect(result.optional).toBeInstanceOf(Array);
        expect(result.notRelevant).toBeInstanceOf(Array);
        
        // Should include contract/invoice in critical items
        expect(result.critical.some(item => 
            item.toLowerCase().includes('contract') || 
            item.toLowerCase().includes('invoice')
        )).toBe(true);
    });
    
    test('should generate checklist for property_damage claim', () => {
        const caseData = { claimType: 'property_damage' };
        const result = generateEvidenceChecklist(caseData);
        
        // Should include photos in critical items
        expect(result.critical.some(item => 
            item.toLowerCase().includes('photo')
        )).toBe(true);
        
        // Should include repair estimates
        expect(result.critical.some(item => 
            item.toLowerCase().includes('estimate') || 
            item.toLowerCase().includes('repair')
        )).toBe(true);
    });
    
    test('should generate checklist for breach_contract claim', () => {
        const caseData = { claimType: 'breach_contract' };
        const result = generateEvidenceChecklist(caseData);
        
        // Should include signed contract in critical items
        expect(result.critical.some(item => 
            item.toLowerCase().includes('contract')
        )).toBe(true);
    });
    
    test('should always include common critical evidence', () => {
        const caseData = { claimType: 'unpaid_debt' };
        const result = generateEvidenceChecklist(caseData);
        
        // Should include proof of service
        expect(result.critical.some(item => 
            item.toLowerCase().includes('service')
        )).toBe(true);
    });
});
