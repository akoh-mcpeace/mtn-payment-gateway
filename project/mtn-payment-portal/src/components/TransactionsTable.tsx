import { useState } from "react";

type TransactionStatus = "PENDING" | "SUCCESSFUL" | "FAILED" | "TIMED_OUT";
type TransactionType = "COLLECTION" | "DISBURSEMENT" | "REFUND" | "TRANSFER";
type Channel = "WEB_PORTAL" | "USSD" | "API" | "MOBILE_APP";

interface Transaction {
  id: string;
  referenceId: string;
  externalId: string;
  financialTransactionId?: string;
  timestamp: string; // ISO string
  payer: string; // MSISDN or email
  payee: string; // MSISDN or email
  amount: number;
  currency: string;
  status: TransactionStatus;
  transactionType: TransactionType;
  channel: Channel;
  performedBy: string;
  reason?: string; // failure reason, if any
}

// Sample data — replace with data fetched from your backend / MoMo API
const sampleTransactions: Transaction[] = [
  {
    id: "1",
    referenceId: "a1b2c3d4-0001",
    externalId: "ORD-10234",
    financialTransactionId: "9023456781",
    timestamp: "2026-09-27T09:12:00Z",
    payer: "237670000001",
    payee: "Merchant Wallet",
    amount: 15000,
    currency: "XAF",
    status: "SUCCESSFUL",
    transactionType: "COLLECTION",
    channel: "WEB_PORTAL",
    performedBy: "system",
  },
  {
    id: "2",
    referenceId: "a1b2c3d4-0002",
    externalId: "ORD-10235",
    timestamp: "2026-09-27T09:20:00Z",
    payer: "237670000002",
    payee: "Merchant Wallet",
    amount: 5000,
    currency: "XAF",
    status: "PENDING",
    transactionType: "COLLECTION",
    channel: "MOBILE_APP",
    performedBy: "system",
  },
  {
    id: "3",
    referenceId: "a1b2c3d4-0003",
    externalId: "ORD-10236",
    timestamp: "2026-09-27T09:25:00Z",
    payer: "237670000003",
    payee: "Merchant Wallet",
    amount: 2500,
    currency: "XAF",
    status: "FAILED",
    transactionType: "COLLECTION",
    channel: "API",
    performedBy: "jane.admin",
    reason: "INSUFFICIENT_FUNDS",
  },
];

function StatusBadge({ status }: { status: TransactionStatus }) {
  const styles: Record<TransactionStatus, string> = {
    SUCCESSFUL: "badge bg-success",
    PENDING: "badge bg-warning text-dark",
    FAILED: "badge bg-danger",
    TIMED_OUT: "badge bg-secondary",
  };
  return <span className={styles[status]}>{status}</span>;
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString();
}

interface TransactionTableProps {
  transactions?: Transaction[];
}

function TransactionTable({
  transactions = sampleTransactions,
}: TransactionTableProps) {
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "ALL">(
    "ALL",
  );
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Transaction | null>(null);

  const filtered = transactions.filter((t) => {
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      t.externalId.toLowerCase().includes(q) ||
      t.referenceId.toLowerCase().includes(q) ||
      (t.financialTransactionId ?? "").toLowerCase().includes(q) ||
      t.payer.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="d-flex justify-content-between mb-3 gap-2 flex-wrap">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: 280 }}
          placeholder="Search reference, external ID, or payer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as TransactionStatus | "ALL")
          }
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESSFUL">Successful</option>
          <option value="FAILED">Failed</option>
          <option value="TIMED_OUT">Timed out</option>
        </select>
      </div>

      <table className="table table-hover align-middle">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Time</th>
            <th scope="col">Reference / External ID</th>
            <th scope="col">Payer</th>
            <th scope="col">Amount</th>
            <th scope="col">Type</th>
            <th scope="col">Channel</th>
            <th scope="col">Status</th>
            <th scope="col">Performed By</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((t, i) => (
            <tr key={t.id}>
              <th scope="row">{i + 1}</th>
              <td>{formatTimestamp(t.timestamp)}</td>
              <td>
                <div>{t.externalId}</div>
                <small className="text-muted">
                  {t.financialTransactionId ?? t.referenceId}
                </small>
              </td>
              <td>{t.payer}</td>
              <td>{formatAmount(t.amount, t.currency)}</td>
              <td>{t.transactionType}</td>
              <td>{t.channel}</td>
              <td>
                <StatusBadge status={t.status} />
              </td>
              <td>{t.performedBy}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSelected(t)}
                >
                  Details
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={10} className="text-center text-muted py-4">
                No transactions match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selected && (
        <div className="card mt-3">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <h5 className="card-title">Transaction details</h5>
              <button
                className="btn-close"
                onClick={() => setSelected(null)}
              ></button>
            </div>
            <dl className="row mb-0">
              <dt className="col-sm-4">Reference ID</dt>
              <dd className="col-sm-8">{selected.referenceId}</dd>
              <dt className="col-sm-4">External ID</dt>
              <dd className="col-sm-8">{selected.externalId}</dd>
              <dt className="col-sm-4">Financial Transaction ID</dt>
              <dd className="col-sm-8">
                {selected.financialTransactionId ?? "—"}
              </dd>
              <dt className="col-sm-4">Payer</dt>
              <dd className="col-sm-8">{selected.payer}</dd>
              <dt className="col-sm-4">Payee</dt>
              <dd className="col-sm-8">{selected.payee}</dd>
              <dt className="col-sm-4">Amount</dt>
              <dd className="col-sm-8">
                {formatAmount(selected.amount, selected.currency)}
              </dd>
              <dt className="col-sm-4">Status</dt>
              <dd className="col-sm-8">
                <StatusBadge status={selected.status} />
              </dd>
              {selected.reason && (
                <>
                  <dt className="col-sm-4">Failure reason</dt>
                  <dd className="col-sm-8">{selected.reason}</dd>
                </>
              )}
              <dt className="col-sm-4">Channel</dt>
              <dd className="col-sm-8">{selected.channel}</dd>
              <dt className="col-sm-4">Performed by</dt>
              <dd className="col-sm-8">{selected.performedBy}</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionTable;
