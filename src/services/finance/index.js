import { dashboardService } from './dashboardService';
import { accountsService } from './accountsService';
import { ledgerService } from './ledgerService';
import { receivablesService } from './receivablesService';
import { payablesService } from './payablesService';
import * as invoiceService from './invoiceService';
import * as paymentService from './paymentService';
import * as expenseService from './expenseService';

export const financeErpService = {
  dashboard: dashboardService,
  accounts: accountsService,
  ledger: ledgerService,
  receivables: receivablesService,
  payables: payablesService,
  invoices: invoiceService,
  payments: paymentService,
  expenses: expenseService
};
