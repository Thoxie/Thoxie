import { assessViability } from '../src/services/viabilityService';

describe('Viability Service', () => {
    test('should return null for incomplete case data', () => {
        const result = assessViability({});
        expect(result).toBeNull();
    });
    
    test('should assess a basic case with moderate viability', () => {
        const caseData = {
            claimType: 'unpaid_debt',
            claimAmount: 5000,
            plaintiff: { name: 'John Doe', address: '123 Main St' },
            defendant: { name: 'Jane Smith', address: '456 Oak Ave' }
        };
        
        const result = assessViability(caseData);
        
        expect(result).not.toBeNull();
        expect(result.score).toBeGreaterThan(0);
        expect(result.score).toBeLessThanOrEqual(5);
        expect(result.scoreLabel).toBeDefined();
        expect(result.summary).toBeDefined();
        expect(result.strengths).toBeInstanceOf(Array);
        expect(result.weaknesses).toBeInstanceOf(Array);
        expect(result.recommendations).toBeInstanceOf(Array);
    });
    
    test('should penalize excessively high claim amounts', () => {
        const caseData1 = {
            claimType: 'unpaid_debt',
            claimAmount: 5000,
            plaintiff: { name: 'John Doe' },
            defendant: { name: 'Jane Smith' }
        };
        
        const caseData2 = {
            claimType: 'unpaid_debt',
            claimAmount: 15000,
            plaintiff: { name: 'John Doe' },
            defendant: { name: 'Jane Smith' }
        };
        
        const result1 = assessViability(caseData1);
        const result2 = assessViability(caseData2);
        
        expect(result2.score).toBeLessThan(result1.score);
    });
    
    test('should give better score when defendant address is known', () => {
        const caseData1 = {
            claimType: 'unpaid_debt',
            claimAmount: 5000,
            plaintiff: { name: 'John Doe' },
            defendant: { name: 'Jane Smith' }
        };
        
        const caseData2 = {
            claimType: 'unpaid_debt',
            claimAmount: 5000,
            plaintiff: { name: 'John Doe' },
            defendant: { name: 'Jane Smith', address: '456 Oak Ave' }
        };
        
        const result1 = assessViability(caseData1);
        const result2 = assessViability(caseData2);
        
        expect(result2.score).toBeGreaterThan(result1.score);
    });
});
