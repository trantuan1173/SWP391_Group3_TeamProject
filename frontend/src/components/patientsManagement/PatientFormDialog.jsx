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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchPatientById } from "@/api/patientApi";

const schema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().optional(),
  password: z.string().optional(),
  identityNumber: z.string().min(9, "Identity number required"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
});

export default function PatientFormDialog({
  open,
  setOpen,
  onSubmit,
  patientId,
}) {
  const isEdit = Boolean(patientId);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      identityNumber: "",
      phoneNumber: "",
      address: "",
      dateOfBirth: "",
      gender: "male",
    },
  });

  useEffect(() => {
    if (open && isEdit && patientId) {
      setLoading(true);
      fetchPatientById(patientId)
        .then((data) => {
          form.reset({
            ...data,
            password: "",
            dateOfBirth: data.dateOfBirth
              ? new Date(data.dateOfBirth).toISOString().split("T")[0]
              : "",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [open, isEdit, patientId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Patient" : "Create Patient"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="p-4 text-gray-500 text-center">Loading...</div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                if (isEdit) onSubmit(patientId, data);
                else onSubmit(data);
              })}
              className="space-y-3"
            >
              {[
                { name: "name", label: "Full Name" },
                { name: "email", label: "Email", type: "email" },
                { name: "password", label: "Password", type: "password" },
                { name: "identityNumber", label: "Identity Number" },
                { name: "phoneNumber", label: "Phone Number" },
                { name: "address", label: "Address" },
                { name: "dateOfBirth", label: "Date of Birth", type: "date" },
              ].map((f) => (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{f.label}</FormLabel>
                      <FormControl>
                        <Input {...field} type={f.type || "text"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-green-500 text-white hover:bg-green-600"
              >
                {isEdit ? "Update Patient" : "Create Patient"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
