"use client";
import { AppBar, Toolbar, Typography, Box, Container, Button } from "@mui/material";
import Link from "next/link";

export default function Shell({ children }: { children: React.ReactNode }) {
    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography sx={{ flexGrow: 1 }}>WerkMate</Typography>
                    <Button color="inherit" component={Link} href="/dashboard">Dashboard</Button>
                    <Button color="inherit" component={Link} href="/clients">Clients</Button>
                    <Button color="inherit" component={Link} href="/quotes">Quotes</Button>
                    <Button color="inherit" component={Link} href="/invoices">Invoices</Button>
                    <Button color="inherit" component={Link} href="/bookings">Bookings</Button>
                </Toolbar>
            </AppBar>
            <Container sx={{ py: 3 }}>{children}</Container>
        </Box>
    );
}
