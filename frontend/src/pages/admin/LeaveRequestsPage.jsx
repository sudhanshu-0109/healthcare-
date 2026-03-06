import Btn from "../../components/ui/Btn";
import Badge from "../../components/ui/Badge";
import { api } from "../../api";

const LeaveRequestsPage = ({ state, setState, user, toast }) => {
    const leaves = (state.leaveRequests || []).slice().sort((a, b) => {
        return (b.created_at || "").localeCompare(a.created_at || "");
    });

    const updateStatus = async (leave, status) => {
        try {
            const updated = await api.updateLeaveRequest(leave.id, { status });
            setState((s) => ({
                ...s,
                leaveRequests: s.leaveRequests.map((l) => (l.id === leave.id ? updated : l)),
            }));
            const staff = state.users.find((u) => u.id === leave.user);
            const name = staff ? staff.name : `User #${leave.user}`;
            toast && toast(`Leave ${status.toLowerCase()} for ${name}.`, "ok");
        } catch (e) {
            toast && toast(e.message || "Failed to update leave.", "err");
        }
    };

    const rows = leaves.map((l) => {
        const staff = state.users.find((u) => u.id === l.user);
        // user_name comes from the backend serializer; fall back to state lookup
        const staffName = l.user_name || (staff ? staff.name : `User #${l.user}`);
        const staffEmail = staff ? staff.email : "";
        return { leave: l, staff, staffName, staffEmail };
    });

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 24 }}>Leave Requests</h2>
            <div className="card">
                {rows.length === 0 ? (
                    <div style={{ color: "var(--tx2)", textAlign: "center", padding: "28px 0" }}>
                        No leave requests submitted yet.
                    </div>
                ) : (
                    <table className="tbl" style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Staff</th>
                                <th>Role</th>
                                <th>Dates</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(({ leave, staffName, staffEmail }) => (
                                <tr key={leave.id}>
                                    <td style={{ fontFamily: "var(--m)", fontSize: 12, color: "var(--tx2)" }}>{leave.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>
                                            {staffName}
                                        </div>
                                        {staffEmail && (
                                            <div style={{ fontSize: 11, color: "var(--tx2)" }}>
                                                {staffEmail}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <Badge s={leave.role.toUpperCase()} />
                                    </td>
                                    <td style={{ fontSize: 12 }}>
                                        {leave.start_date} → {leave.end_date}
                                    </td>
                                    <td style={{ fontSize: 12, maxWidth: 260 }}>
                                        {leave.reason}
                                    </td>
                                    <td>
                                        <Badge s={leave.status} />
                                    </td>
                                    <td>
                                        {leave.status === "PENDING" ? (
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <Btn
                                                    ch="Approve"
                                                    v="pri"
                                                    sz="sm"
                                                    onClick={() => updateStatus(leave, "APPROVED")}
                                                />
                                                <Btn
                                                    ch="Decline"
                                                    v="dng"
                                                    sz="sm"
                                                    onClick={() => updateStatus(leave, "REJECTED")}
                                                />
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: 11, color: "var(--tx2)" }}>
                                                No actions
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default LeaveRequestsPage;

