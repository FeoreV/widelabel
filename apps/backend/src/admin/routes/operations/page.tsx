import React, { useState, useEffect } from "react";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChartBar } from "@medusajs/icons";
import { Container, Heading, Table, Badge } from "@medusajs/ui";

interface Metrics {
  active_holds: {
    total_active_holds: number;
    holds_expiring_soon: number;
    reserved_variants_count: number;
  };
  payment_failures: Array<{
    id: string;
    cart_id: string;
    amount: number;
    status: string;
    error_message?: string;
  }>;
  webhook_lag: {
    total_webhooks_processed: number;
    avg_lag_ms: number;
    max_lag_ms: number;
  };
  shipment_failures: Array<{
    order_number: string;
    error_reason: string;
  }>;
  timestamp: string;
}

const OperationsPage = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/admin/wide-label/operations/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
        }
      } catch (err) {
        console.error("Failed to fetch operations metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container className="p-6 space-y-6">
      <Heading level="h1">Operations Dashboard</Heading>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-ui-bg-subtle">
          <p className="text-sm text-ui-fg-subtle">Active Cart Holds</p>
          <p className="text-2xl font-bold">{metrics?.active_holds.total_active_holds || 0}</p>
          <p className="text-xs text-ui-fg-muted mt-1">
            {metrics?.active_holds.holds_expiring_soon || 0} expiring in &lt; 5m
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-ui-bg-subtle">
          <p className="text-sm text-ui-fg-subtle">Avg Webhook Processing Lag</p>
          <p className="text-2xl font-bold">{metrics?.webhook_lag.avg_lag_ms || 0} ms</p>
          <p className="text-xs text-ui-fg-muted mt-1">
            Processed {metrics?.webhook_lag.total_webhooks_processed || 0} webhooks
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-ui-bg-subtle">
          <p className="text-sm text-ui-fg-subtle">Payment Failures</p>
          <p className="text-2xl font-bold text-ui-fg-error">
            {metrics?.payment_failures.length || 0}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Heading level="h2">Payment Failure Logs</Heading>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Cart ID</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Table.Row><Table.Cell>Loading...</Table.Cell></Table.Row>
            ) : !metrics?.payment_failures?.length ? (
              <Table.Row><Table.Cell>No payment failures recorded.</Table.Cell></Table.Row>
            ) : (
              metrics.payment_failures.map((pf) => (
                <Table.Row key={pf.id}>
                  <Table.Cell>{pf.id}</Table.Cell>
                  <Table.Cell>{pf.cart_id}</Table.Cell>
                  <Table.Cell>{(pf.amount / 100).toFixed(2)} RUB</Table.Cell>
                  <Table.Cell><Badge color="red">{pf.status}</Badge></Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Operations",
  icon: ChartBar,
});

export default OperationsPage;
