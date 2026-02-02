import { calculateDamages } from '../src/services/damagesService';

describe('Damages Service', () => {
    test('should return null for missing claim amount', () => {
        const result = calculateDamages({});
        expect(result).toBeNull();
    });
    
    test('should calculate conservative damages', () => {
        const caseData = {
            claimType: 'property_damage',
            claimAmount: 1000
        };
        
        const result = calculateDamages(caseData);
        
        expect(result).not.toBeNull();
        expect(result.total).toBeGreaterThan(0);
        expect(result.breakdown).toBeInstanceOf(Array);
        expect(result.breakdown.length).toBeGreaterThan(0);
    });
    
    test('should include court costs and service fees', () => {
        const caseData = {
            claimType: 'unpaid_debt',
            claimAmount: 5000
        };
        
        const result = calculateDamages(caseData);
        
        const hasCourtCosts = result.breakdown.some(item => 
            item.category.toLowerCase().includes('court') || 
            item.category.toLowerCase().includes('filing')
        );
        const hasServiceFees = result.breakdown.some(item => 
            item.category.toLowerCase().includes('service')
        );
        
        expect(hasCourtCosts).toBe(true);
        expect(hasServiceFees).toBe(true);
    });
    
    test('should apply conservative percentage to claim amount', () => {
        const caseData = {
            claimType: 'breach_contract',
            claimAmount: 10000
        };
        
        const result = calculateDamages(caseData);
        
        // Conservative estimate should be less than full claim amount
        expect(result.total).toBeLessThan(caseData.claimAmount + 200); // Plus typical fees
    });
});
