"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
    Box, Button, Card, CardContent, Divider, FormControl, InputLabel, MenuItem,
    Select, Stack, TextField, Typography, List, ListItem, ListItemText, Alert
} from "@mui/material";

type Member = { userId: string; name?: string|null; email?: string|null; role: "owner"|"admin"|"staff" };
type InviteResp = {
    id: string; token: string; email: string; role: "owner"|"admin"|"staff";
    expiresAt: string; acceptUrl: string; registerUrl: string;
};

export default function TeamPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"owner"|"admin"|"staff">("staff");
    const [lastInvite, setLastInvite] = useState<InviteResp|undefined>();
    const [error, setError] = useState<string|undefined>();
    const accountId = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("accountId") ?? "" : ""), []);

    const loadMembers = async () => {
        const data = await api.get(`accounts/${accountId}/members`).json<Member[]>();
        setMembers(data);
    };

    useEffect(() => { if (accountId) loadMembers().catch(()=>{}); }, [accountId]);

    const sendInvite = async () => {
        setError(undefined);
        try {
            const res = await api.post(`accounts/${accountId}/invites`, {
                json: { email: email.trim(), role }
            }).json<InviteResp>();
            setLastInvite(res);
            setEmail("");
            await loadMembers();
        } catch (e: any) {
            const msg = e?.response ? await e.response.text() : e?.message ?? "Failed";
            setError(msg);
        }
    };

    return (
        <Stack gap={3}>
            <Typography variant="h5">Team</Typography>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Invite a teammate</Typography>
                    {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
                    <Stack direction={{ xs:"column", sm:"row" }} gap={2} alignItems="flex-start">
                        <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} sx={{ minWidth: 280 }} />
                        <FormControl sx={{ minWidth: 180 }}>
                            <InputLabel id="role-label">Role</InputLabel>
                            <Select labelId="role-label" label="Role" value={role} onChange={e=>setRole(e.target.value as any)}>
                                <MenuItem value="staff">Staff</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="owner">Owner</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="contained" onClick={sendInvite} disabled={!email.trim()}>Send invite</Button>
                    </Stack>

                    {lastInvite && (
                        <Box sx={{ mt: 3 }}>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Invite created</Typography>
                            <Stack gap={1}>
                                <Typography variant="body2">Accept URL:</Typography>
                                <CodeLine text={lastInvite.acceptUrl} />
                                <Typography variant="body2" sx={{ mt: 1 }}>Register URL (Keycloak):</Typography>
                                <CodeLine text={lastInvite.registerUrl} />
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    Expires: {new Date(lastInvite.expiresAt).toLocaleString()}
                                </Typography>
                            </Stack>
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Members</Typography>
                    <List dense>
                        {members.map(m => (
                            <ListItem key={m.userId}
                                      secondaryAction={<Typography variant="caption" sx={{ textTransform: "uppercase" }}>{m.role}</Typography>}
                            >
                                <ListItemText
                                    primary={m.name || m.email || m.userId}
                                    secondary={m.email && m.name ? m.email : undefined}
                                />
                            </ListItem>
                        ))}
                        {!members.length && <Typography color="text.secondary">No members yet.</Typography>}
                    </List>
                </CardContent>
            </Card>
        </Stack>
    );
}

function CodeLine({ text }: { text: string }) {
    const copy = async () => { await navigator.clipboard.writeText(text); };
    return (
        <Stack direction="row" gap={1} alignItems="center">
            <Box component="code" sx={{ px: 1, py: 0.5, bgcolor: "action.hover", borderRadius: 1, overflowX: "auto" }}>
                {text}
            </Box>
            <Button size="small" onClick={copy}>Copy</Button>
        </Stack>
    );
}
