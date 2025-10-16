import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchRoleById } from "@/api/roleApi";

const schema = z.object({
  name: z.string().min(3, "Role name is required"),
});

export default function RoleFormDialog({ open, setOpen, onSubmit, roleId }) {
  const isEdit = Boolean(roleId);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (open && isEdit && roleId) {
      setLoading(true);
      fetchRoleById(roleId)
        .then((data) => {
          form.reset({ name: data.name || "" });
        })
        .finally(() => setLoading(false));
    }
  }, [open, isEdit, roleId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Role" : "Create Role"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="p-4 text-gray-500 text-center">Loading...</div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                if (isEdit) onSubmit(roleId, data);
                else onSubmit(data);
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter role name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-green-500 text-white hover:bg-green-600"
              >
                {isEdit ? "Update Role" : "Create Role"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
