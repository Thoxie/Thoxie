import { TIERS, FEATURES, hasFeature, FREE_TIER_LIMITS } from '../src/utils/featureFlags';

describe('Feature Flags', () => {
    test('should define tier constants', () => {
        expect(TIERS.FREE).toBe('free');
        expect(TIERS.PAID).toBe('paid');
    });
    
    test('should define free tier limits', () => {
        expect(FREE_TIER_LIMITS.MAX_CASES).toBe(1);
        expect(FREE_TIER_LIMITS.WATERMARK_ENABLED).toBe(true);
        expect(FREE_TIER_LIMITS.WATERMARK_TEXT).toBeDefined();
    });
    
    test('should allow free tier features for free users', () => {
        expect(hasFeature('GUIDED_INTAKE', TIERS.FREE)).toBe(true);
        expect(hasFeature('VIABILITY_ASSESSMENT', TIERS.FREE)).toBe(true);
        expect(hasFeature('DAMAGES_CALCULATOR', TIERS.FREE)).toBe(true);
        expect(hasFeature('EVIDENCE_CHECKLIST', TIERS.FREE)).toBe(true);
        expect(hasFeature('DRAFT_PREVIEWS', TIERS.FREE)).toBe(true);
        expect(hasFeature('COURT_SELECTION_PREVIEW', TIERS.FREE)).toBe(true);
    });
    
    test('should restrict paid features for free users', () => {
        expect(hasFeature('DOCUMENT_EXPORT', TIERS.FREE)).toBe(false);
        expect(hasFeature('FILING_RULES', TIERS.FREE)).toBe(false);
        expect(hasFeature('SERVICE_INSTRUCTIONS', TIERS.FREE)).toBe(false);
        expect(hasFeature('HEARING_PREP', TIERS.FREE)).toBe(false);
        expect(hasFeature('MULTIPLE_CASES', TIERS.FREE)).toBe(false);
        expect(hasFeature('DEADLINE_AUTOMATION', TIERS.FREE)).toBe(false);
        expect(hasFeature('REMOVE_WATERMARKS', TIERS.FREE)).toBe(false);
    });
    
    test('should allow all features for paid users', () => {
        expect(hasFeature('GUIDED_INTAKE', TIERS.PAID)).toBe(true);
        expect(hasFeature('DOCUMENT_EXPORT', TIERS.PAID)).toBe(true);
        expect(hasFeature('FILING_RULES', TIERS.PAID)).toBe(true);
        expect(hasFeature('SERVICE_INSTRUCTIONS', TIERS.PAID)).toBe(true);
        expect(hasFeature('HEARING_PREP', TIERS.PAID)).toBe(true);
        expect(hasFeature('MULTIPLE_CASES', TIERS.PAID)).toBe(true);
        expect(hasFeature('DEADLINE_AUTOMATION', TIERS.PAID)).toBe(true);
        expect(hasFeature('REMOVE_WATERMARKS', TIERS.PAID)).toBe(true);
    });
    
    test('should return false for unknown features', () => {
        expect(hasFeature('UNKNOWN_FEATURE', TIERS.FREE)).toBe(false);
        expect(hasFeature('UNKNOWN_FEATURE', TIERS.PAID)).toBe(false);
    });
});
