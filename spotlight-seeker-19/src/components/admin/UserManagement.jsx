import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

const mockUsers = [
  { id: "1", name: "Priya Sharma", role: "Alumni", status: "Pending", email: "priya.sharma@gmail.com" },
  { id: "2", name: "Anita Singh", role: "Alumni", status: "Active", email: "anita.singh@company.com" },
  { id: "3", name: "Rajesh Kumar", role: "Alumni", status: "Pending", email: "rajesh.kumar@infosys.com" },
  { id: "4", name: "Sneha Patel", role: "Alumni", status: "Active", email: "sneha.patel@tcs.com" },
  { id: "5", name: "Amit Gupta", role: "Alumni", status: "Inactive", email: "amit.gupta@wipro.com" },
  { id: "6", name: "Kavya Reddy", role: "Alumni", status: "Pending", email: "kavya.reddy@microsoft.com" },
  { id: "7", name: "Rohit Sharma", role: "Faculty", status: "Active", email: "rohit.sharma@sgsits.ac.in" },
  { id: "8", name: "Dr. Meena Agarwal", role: "Faculty", status: "Active", email: "meena.agarwal@sgsits.ac.in" },
];

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState(mockUsers);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status) => {
    switch (status) {
      case "Active":
        return "default";
      case "Pending":
        return "secondary";
      case "Inactive":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-success text-success-foreground";
      case "Pending":
        return "bg-warning text-warning-foreground";
      case "Inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleUserAction = (userId, action) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? {
              ...user,
              status: action === "ban" ? "Inactive" : 
                     action === "approve" ? "Active" : 
                     "Active"
            }
          : user
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{user.name}</div>
                    {user.email && (
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-foreground">{user.role}</span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusVariant(user.status)}
                    className={`${getStatusColor(user.status)} font-medium`}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.role === "Alumni" && user.status === "Pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction(user.id, "approve")}
                        className="text-success border-success hover:bg-success hover:text-success-foreground"
                      >
                        Approve
                      </Button>
                    )}
                    {user.role === "Alumni" && user.status === "Active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction(user.id, "ban")}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        Ban
                      </Button>
                    )}
                    {user.role === "Alumni" && user.status === "Inactive" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction(user.id, "activate")}
                        className="text-success border-success hover:bg-success hover:text-success-foreground"
                      >
                        Activate
                      </Button>
                    )}
                    {user.role === "Faculty" && (
                      <span className="text-sm text-muted-foreground">No actions</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}