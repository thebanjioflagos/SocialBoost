
import { User, SubscriptionPlan } from '../types';
import { dataService } from './dataService';

/**
 * PRODUCTION BILLING NODE
 * Handles Reference-Locked Settlement Verification.
 */
export const paymentService = {
  /**
   * INITIATE TRANSACTION
   */
  async initiateSubscription(plan: SubscriptionPlan, user: User): Promise<string> {
    console.log(`[BILLING-PROD] Handshaking with Regional Payment Switch for ${plan}...`);
    
    // Simulate the redirect logic to Paystack/Flutterwave
    await new Promise(res => setTimeout(res, 1500));
    
    // Return a unique settlement reference
    return `SB_REF_${crypto.randomUUID().split('-')[0].toUpperCase()}_${Date.now()}`;
  },

  /**
   * VERIFY SETTLEMENT
   * This mimics the server-side webhook verification of a transaction.
   */
  async verifyPayment(reference: string, user: User): Promise<User> {
    console.log(`[BILLING-PROD] Polling Settlement Node: ${reference}`);
    
    // Simulate regional bank latency
    await new Promise(res => setTimeout(res, 2500));
    
    // Production Simulation: Verification of funds
    const isSuccess = reference.startsWith('SB_REF');
    
    if (!isSuccess) throw new Error("Settlement Verification Denied by Payment Switch.");

    const updatedUser = {
      ...user,
      usage: {
        ...user.usage,
        plan: (reference.includes('PRO') ? 'pro' : 'enterprise') as SubscriptionPlan
      }
    };

    await dataService.updateUser(updatedUser);
    dataService.logActivity("System", `Settlement Confirmed. Upgraded Node: ${updatedUser.usage.plan.toUpperCase()}`);
    
    return updatedUser;
  }
};
