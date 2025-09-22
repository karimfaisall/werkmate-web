"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, Stack, TextField, List, ListItem, Typography } from "@mui/material";

type Client = { id: string; name?: string | null; email?: string | null };

export default function Page() {
    const [clients, setClients] = useState<Client[]>([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const load = async () => {
        const data = await api.get("clients").json<Client[]>();
        setClients(data);
    };
    useEffect(() => { load(); }, []);

    const create = async () => {
        const payload: any = {};
        if (name.trim()) payload.name = name.trim();
        if (email.trim()) payload.email = email.trim();
        await api.post("clients", { json: payload });
        setName(""); setEmail(""); await load();
    };

    return (
        <>
            <Typography variant="h6" sx={{ mb: 2 }}>Clients</Typography>
            <Stack direction="row" gap={2} sx={{ mb: 2 }}>
                <TextField label="Name" value={name} onChange={e=>setName(e.target.value)} />
                <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                <Button variant="contained" onClick={create}>Add</Button>
            </Stack>
            <List>{clients.map(c => <ListItem key={c.id}>{c.name} — {c.email}</ListItem>)}</List>
        </>
    );
}
