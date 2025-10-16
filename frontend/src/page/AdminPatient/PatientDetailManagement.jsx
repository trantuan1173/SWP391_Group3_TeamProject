import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/layout/AdminLayout";
import { fetchPatientById } from "@/api/patientApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function PatientDetailManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await fetchPatientById(id);
        setPatient(data);
      } catch (error) {
        console.error("Error fetching patient:", error);
      }
    };
    loadPatient();
  }, [id]);

  if (!patient) {
    return (
      <AdminLayout>
        <p className="text-center py-10">Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 rounded-md h-full">
        {/* Back Button */}
        <Button
          className="!mb-6 !rounded-md"
          onClick={() => navigate("/admin/patients")}
        >
          Back To Patients
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Avatar & Basic Info */}
          <Card className="col-span-1 flex flex-col items-center p-6">
            <Avatar className="w-40 h-40">
              <AvatarImage
                src={`http://localhost:1118${patient.avatar || ""}`}
                alt={patient.name}
              />
              <AvatarFallback>
                {patient.name?.charAt(0).toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>

            <p className="text-lg font-bold mb-0 mt-3">{patient.name}</p>

            <div
              className={`px-4 py-2 rounded-full mt-2 text-sm font-bold ${
                patient.isActive
                  ? "bg-green-500 text-white"
                  : "bg-gray-400 text-white"
              }`}
            >
              {patient.isActive ? "ACTIVE" : "INACTIVE"}
            </div>
          </Card>

          {/* Detailed Info */}
          <Card className="col-span-3 p-10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid p-3 grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium text-gray-600">Name</p>
                  <p>{patient.name || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Email</p>
                  <p>{patient.email || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Identity Number</p>
                  <p>{patient.identityNumber || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Phone Number</p>
                  <p>{patient.phoneNumber || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Address</p>
                  <p>{patient.address || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Date of Birth</p>
                  <p>
                    {patient.dateOfBirth
                      ? new Date(patient.dateOfBirth).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Gender</p>
                  <p className="capitalize">{patient.gender || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Created At</p>
                  <p>
                    {new Date(patient.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Updated At</p>
                  <p>
                    {new Date(patient.updatedAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
