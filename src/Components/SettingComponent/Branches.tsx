
const branches = [
  { name: 'Main Branch', location: 'Downtown' },
  { name: 'North Side', location: 'North District' },
  { name: 'West Wing', location: 'West Mall' },
];

function Branches() {


  return (
      <div className='flex flex-col gap-6'>
            <h1 className='text-title font-bold text-2xl'>Branch Setting</h1>


        {/* Branches List */}
        <div className="shadow-xl flex flex-col gap-10 rounded-xl p-6 mb-8">
          {branches.map((branch) => (
            <div key={branch.name} className='flex flex-col gap-5' >
              <div className="text-primary font-medium cursor-pointer ">{branch.name}</div>
              <div className="text-text text-base">Location: <span className="font-normal">{branch.location}</span></div>
            </div>
          ))}
        </div>

       
        {/* Save Button */}
        <div className="flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">
            Save Settings
          </button>
        </div>
      </div>
  );
}

export default Branches;