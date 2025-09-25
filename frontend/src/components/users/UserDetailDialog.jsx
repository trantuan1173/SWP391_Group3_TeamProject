import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function UserDetailDialog({ open, setOpen, user }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Detail</DialogTitle>
        </DialogHeader>
        {user ? (
          <div className="space-y-2">
            <p>
              <b>Name:</b> {user.name}
            </p>
            <p>
              <b>Email:</b> {user.email}
            </p>
            <p>
              <b>Phone:</b> {user.phoneNumber}
            </p>
            <p>
              <b>Identity:</b> {user.identityNumber}
            </p>
            <p>
              <b>Date of Birth:</b> {user.dateOfBirth}
            </p>
            <p>
              <b>Gender:</b> {user.gender}
            </p>
            <p>
              <b>Role:</b> {user.role}
            </p>
            {user.avatar && (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-24 h-24 rounded-full"
              />
            )}
          </div>
        ) : (
          <p>No user selected</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
