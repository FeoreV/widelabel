import React, { useState, useEffect } from "react";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { TagSolid } from "@medusajs/icons";
import { Container, Heading, Button, Table, Badge, Input, Label } from "@medusajs/ui";

interface Drop {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  ends_at?: string | null;
  status: "draft" | "scheduled" | "active" | "ended" | "archived";
}

const DropsPage = () => {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [startsAt, setStartsAt] = useState("");

  const fetchDrops = async () => {
    try {
      const res = await fetch("/store/wide-label/admin/drops");
      if (res.ok) {
        const data = await res.json();
        setDrops(data.drops || []);
      }
    } catch (err) {
      console.error("Failed to fetch drops", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrops();
  }, []);

  const handleCreateDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !startsAt) return;

    try {
      const res = await fetch("/store/wide-label/admin/drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          starts_at: startsAt,
          status: "scheduled",
        }),
      });
      if (res.ok) {
        setTitle("");
        setSlug("");
        setStartsAt("");
        fetchDrops();
      }
    } catch (err) {
      console.error("Failed to create drop", err);
    }
  };

  return (
    <Container className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Drop Management</Heading>
          <p className="text-ui-fg-subtle text-sm">Schedule and manage 1-of-1 inventory drop releases</p>
        </div>
      </div>

      <form onSubmit={handleCreateDrop} className="grid grid-cols-4 gap-4 p-4 border rounded-lg bg-ui-bg-subtle">
        <div>
          <Label>Title</Label>
          <Input placeholder="Archive Drop #01" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label>Slug</Label>
          <Input placeholder="archive-drop-01" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div>
          <Label>Start Date</Label>
          <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
        </div>
        <div className="flex items-end">
          <Button type="submit" variant="primary">Create Drop</Button>
        </div>
      </form>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Title</Table.HeaderCell>
            <Table.HeaderCell>Slug</Table.HeaderCell>
            <Table.HeaderCell>Starts At</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Row><Table.Cell>Loading...</Table.Cell></Table.Row>
          ) : drops.length === 0 ? (
            <Table.Row><Table.Cell>No drops created yet.</Table.Cell></Table.Row>
          ) : (
            drops.map((drop) => (
              <Table.Row key={drop.id}>
                <Table.Cell className="font-medium">{drop.title}</Table.Cell>
                <Table.Cell>{drop.slug}</Table.Cell>
                <Table.Cell>{new Date(drop.starts_at).toLocaleString()}</Table.Cell>
                <Table.Cell>
                  <Badge color={drop.status === "active" ? "green" : drop.status === "scheduled" ? "blue" : "grey"}>
                    {drop.status}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Drops",
  icon: TagSolid,
});

export default DropsPage;
