/**
 * @file page.tsx
 * @description The main page for viewing product suggestions in the admin dashboard.
 */
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { getAdminSuggestions, deleteSuggestion, type Suggestion } from '@/lib/actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Search, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 20;

export default function AdminSuggestionsPage() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();

    const fetchSuggestions = useCallback(async () => {
        setIsLoading(true);
        const data = await getAdminSuggestions();
        setSuggestions(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    const handleDelete = async (id: number) => {
        const result = await deleteSuggestion(id);
        if (result.success) {
            toast({ title: "Suggestion Deleted", description: "The suggestion has been removed." });
            fetchSuggestions();
        } else {
            toast({ variant: "destructive", title: "Deletion Failed", description: result.message });
        }
    };
    
    const filteredSuggestions = useMemo(() => {
        return suggestions.filter(s =>
            s.suggestion.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suggestions, searchTerm]);

    const totalPages = Math.ceil(filteredSuggestions.length / ITEMS_PER_PAGE);
    const paginatedSuggestions = filteredSuggestions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const renderTableBody = () => {
        if (isLoading) {
            return Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
            ));
        }

        if (paginatedSuggestions.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No suggestions found.
                    </TableCell>
                </TableRow>
            );
        }

        return paginatedSuggestions.map(s => (
            <TableRow key={s.id}>
                <TableCell className="max-w-xl">
                    <p className="truncate">{s.suggestion}</p>
                </TableCell>
                <TableCell>{format(new Date(s.created_at), 'dd MMM yyyy, h:mm a')}</TableCell>
                <TableCell>
                     <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete this suggestion. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(s.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
            </TableRow>
        ));
    };
    
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Product Suggestions</h1>
                    <p className="text-muted-foreground">
                        Review valuable feedback and product ideas from your users.
                    </p>
                </div>
            </div>
             <Card className="rounded-lg">
                <CardHeader>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                        placeholder="Search suggestions..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-3/4">Suggestion</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {renderTableBody()}
                        </TableBody>
                    </Table>
                </CardContent>
                {totalPages > 1 && (
                    <CardFooter>
                        <div className="flex items-center justify-between w-full">
                            <div className="text-xs text-muted-foreground">
                                Showing{' '}
                                <strong>
                                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredSuggestions.length)}
                                </strong>{' '}
                                of <strong>{filteredSuggestions.length}</strong> suggestions
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}