import { TableHeaderSearch } from "../Table/TableHeaderSearch";
import { DataTable } from "../Table/DataTable";
import TableRowUser from "../Table/TableRowUser";
import DeactivateUser from "./DeactivateUser";
import React from "react";
import UserInfo from "./UserInfo";

const columns = [
  "User Name",
  "Email Address",
  "Branch Assined",
  "Role",
  "Status",
  "Last Login"
];

const data = [
  {
    id: '1',
    "User Name": "Emily Johnson",
    "Email Address": "emily.j@pharmadmin.com",
    "Branch Assined": "North Side",
    "Role": "Pharmacist",
    "Status": "Active",
    "Last Login": "2 days ago"
  },
  {
    id: '2',
    "User Name": "Michael Smith",
    "Email Address": "michael.s@pharmadmin.com",
    "Branch Assined": "Main Branch",
    "Role": "Technician",
    "Status": "Active",
    "Last Login": "1 week ago"
  },
  {
    id: '3',
    "User Name": "Sarah Davis",
    "Email Address": "sarah.d@pharmadmin.com",
    "Branch Assined": "West Wing",
    "Role": "Manager",
    "Status": "Active",
    "Last Login": "Today"
  },
  {
    id: '4',
    "User Name": "Jessica Martinez",
    "Email Address": "jessica.m@pharmadmin.com",
    "Branch Assined": "Main Branch",
    "Role": "Technician",
    "Status": "Inactive",
    "Last Login": "3 weeks ago"
  },
  {
    id: '5',
    "User Name": "Ashley Wilson",
    "Email Address": "ashley.w@pharmadmin.com",
    "Branch Assined": "Main Branch",
    "Role": "Admin",
    "Status": "Active",
    "Last Login": "Today"
  },
  {
    id: '6',
    "User Name": "Olivia Anderson",
    "Email Address": "olivia.a@pharmadmin.com",
    "Branch Assined": "North Side",
    "Role": "Pharmacist",
    "Status": "Active",
    "Last Login": "Yesterday"
  },
  {
    id: '7',
    "User Name": "Joshua Moore",
    "Email Address": "joshua.m@pharmadmin.com",
    "Branch Assined": "North Side",
    "Role": "Technician",
    "Status": "Inactive",
    "Last Login": "1 month ago"
  }
];
// interface User {
//   id: number;
//   name: string;
//   email: string;
//   address: string;
//   phone_number: string;
//   role_name: string;
//   branches_id: number;
// }

export default function UserManage() {
  const [deactivateId, setDeactivateId] = React.useState<string | null>(null);
  const [showInfo, setShowInfo] = React.useState<string | null>(null);
  const handleBack = () => {
    setShowInfo(null);
  };

  return (
    <>
      {showInfo ? (
       <UserInfo userId={showInfo}  onBack={handleBack}/>

      ):(
<div >
      <TableHeaderSearch 
        title="User Management"
        buttonText="Add New User"
        onAddClick={() => console.log('Add User Clicked')}
      />
      <DataTable
        columns={columns}
        data={data}
        RowComponent={TableRowUser}
        renderDropdown={(id: string) => (
          <div>
            <button onClick={() => setShowInfo( id)} className="block w-full text-left text-label  text-base px-4 py-2 hover:bg-gray-50">Show User Info </button>
            <button onClick={() => setDeactivateId(id)} className="block w-full text-left text-label text-base px-4 py-2 hover:bg-gray-50">Deactivate User</button>
          </div>
        )}
      />
      <div className="flex justify-between items-center px-2 py-4 text-sm text-gray-500">
        <span>Total Number of Users: <b>135</b></span>
        <span>Previous <b>1 of 10</b> Next</span>
      </div>
      {deactivateId && (
        <DeactivateUser
          onClose={() => setDeactivateId(null)}
          id={deactivateId}
        />
      )}
      </div>
      )
      
      }
      
    </>
  )
}
