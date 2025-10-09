import { type Component, createSignal, onMount } from "solid-js";

import {
  createDisplacementMap,
  generateDisplacementArray,
  imageDataToDataURL,
} from "./glassPhysics";

const data = generateDisplacementArray(
  127, // samples
  0.3, // bezelWidth (30% of radius is bezel)
  100, // glassThickness in pixels
);

console.log("Max displacement:", data.maxDisplacement);
console.log("First 10 samples:", data.displacements.slice(0, 10));
console.log("Last 10 samples:", data.displacements.slice(-10));

type Person = {
  id: string;
  name: string;
  birthday: string; // YYYY-MM-DD format
};

const calculateDayNumber = (birthday: string): number => {
  const birth = new Date(birthday);
  const today = new Date();
  const diff = today.getTime() - birth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

const App: Component = () => {
  const data = generateDisplacementArray(127, 0.3, 100);
  const imageData = createDisplacementMap(256, 128, data);
  const dataURL = imageDataToDataURL(imageData);

  const circleSize = 256; // Match our displacement map size
  const filterId = "liquidGlassFilter";

  console.log("Data URL generated:", dataURL.substring(0, 50) + "...");

  const [people, setPeople] = createSignal<Person[]>([]);
  const [newName, setNewName] = createSignal("");
  const [newBirthday, setNewBirthday] = createSignal("");
  const [isAddDialogOpen, setIsAddDialogOpen] = createSignal(false);

  const [editingPerson, setEditingPerson] = createSignal<Person | null>(null);
  const [editName, setEditName] = createSignal("");
  const [editBirthday, setEditBirthday] = createSignal("");

  // Load from localStorage on mount
  onMount(() => {
    const saved = localStorage.getItem("hectade-people");
    if (saved) {
      setPeople(JSON.parse(saved));
    }
  });

  // Save to localStorage whenever people changes
  const savePeople = (newPeople: Person[]) => {
    setPeople(newPeople);
    localStorage.setItem("hectade-people", JSON.stringify(newPeople));
  };

  const handleAddPerson = () => {
    if (!newName() || !newBirthday()) return;

    const person: Person = {
      id: Date.now().toString(),
      name: newName(),
      birthday: newBirthday(),
    };

    savePeople([...people(), person]);
    setNewName("");
    setNewBirthday("");
    setIsAddDialogOpen(false);
  };

  const handleRemovePerson = (id: string) => {
    savePeople(people().filter((p) => p.id !== id));
  };

  const openEditDialog = (person: Person) => {
    setEditingPerson(person);
    setEditName(person.name);
    setEditBirthday(person.birthday);
  };

  const handleEditPerson = () => {
    const person = editingPerson();
    if (!person || !editName() || !editBirthday()) return;

    savePeople(
      people().map((p) =>
        p.id === person.id
          ? { ...p, name: editName(), birthday: editBirthday() }
          : p,
      ),
    );
    setEditingPerson(null);
  };

  return (
    <div>
      {/* SVG Filter Definition */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter
            id={filterId}
            x="-50%" // <-- CHANGED! Expand filter region
            y="-50%" // <-- CHANGED!
            width="300%" // <-- CHANGED!
            height="300%"
            color-interpolation-filters="sRGB"
            filterUnits="objectBoundingBox"
            primitiveUnits="objectBoundingBox" // <-- ADD THIS!
          >
            <feImage
              href={dataURL}
              result="displacementMap"
              preserveAspectRatio="none"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="displacementMap"
              scale={data.maxDisplacement}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Animated Background */}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          position: "relative",
          background: "#000",
        }}
      >
        {/* Moving flower image */}
        <div
          style={{
            position: "absolute",
            width: "150%",
            height: "150%",
            "background-image":
              "url(https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/flowers.jpg)",
            "background-size": "cover",
            "background-position": "center",
            animation: "slowPan 20s infinite alternate ease-in-out",
          }}
        />

        {/* Glass Circle - stationary */}
        <div
          style={{
            width: `${circleSize}px`,
            height: `${circleSize}px`,
            "border-radius": "50%",
            "backdrop-filter": `url(#${filterId})`,
            background: "rgba(255, 255, 255, 0.05)",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            position: "relative",
            "z-index": 10,
          }}
        />
      </div>

      <div
        style={{
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          background: "red",
          filter: `url(#${filterId})`,
          "margin-top": "20px",
        }}
      >
        Test Box
      </div>

      {/* CSS Animation */}
      <style>{`
            @keyframes slowPan {
              0% { transform: translate(-10%, -10%); }
              100% { transform: translate(10%, 10%); }
            }
          `}</style>
    </div>
    // <div class="min-h-screen bg-gray-50">
    //   {/* Header */}
    //   <header class="bg-white shadow-sm p-4 flex justify-between items-center">
    //     <h1 class="text-2xl font-bold">Hectade Calendar</h1>
    //     <Dialog open={isAddDialogOpen()} onOpenChange={setIsAddDialogOpen}>
    //       <Dialog.Trigger
    //         as={Button}
    //         class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    //       >
    //         Add Friend
    //       </Dialog.Trigger>
    //       <Dialog.Portal>
    //         <Dialog.Overlay class="fixed inset-0 bg-black/50" />
    //         <Dialog.Content class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg w-96">
    //           <Dialog.Title class="text-xl font-bold mb-4">
    //             Add Friend
    //           </Dialog.Title>
    //           <Dialog.Description class="mb-4 text-gray-600">
    //             Add a friend's name and birthday
    //           </Dialog.Description>

    //           <div class="space-y-4">
    //             <TextField value={newName()} onChange={setNewName}>
    //               <TextField.Label class="block text-sm font-medium mb-1">
    //                 Name
    //               </TextField.Label>
    //               <TextField.Input
    //                 class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    //                 placeholder="Enter name"
    //               />
    //             </TextField>

    //             <TextField value={newBirthday()} onChange={setNewBirthday}>
    //               <TextField.Label class="block text-sm font-medium mb-1">
    //                 Birthday
    //               </TextField.Label>
    //               <TextField.Input
    //                 type="date"
    //                 class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    //               />
    //             </TextField>
    //           </div>

    //           <div class="flex gap-2 mt-6">
    //             <Button
    //               onClick={handleAddPerson}
    //               class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    //             >
    //               Add
    //             </Button>
    //             <Dialog.CloseButton class="flex-1 px-4 py-2 border rounded hover:bg-gray-50">
    //               Cancel
    //             </Dialog.CloseButton>
    //           </div>
    //         </Dialog.Content>
    //       </Dialog.Portal>
    //     </Dialog>
    //   </header>

    //   {/* Main content */}
    //   <main class="container mx-auto p-6">
    //     <For each={people()}>
    //       {(person) => {
    //         const dayNumber = calculateDayNumber(person.birthday);
    //         const hectade = Math.floor(dayNumber / 100);

    //         return (
    //           <div class="bg-white rounded-lg shadow p-6 mb-4 group">
    //             <div class="flex justify-between items-start">
    //               <div>
    //                 <h2 class="text-xl font-semibold mb-2">{person.name}</h2>
    //                 <p class="text-gray-600">
    //                   Day {dayNumber.toLocaleString()} of life
    //                 </p>
    //                 <p class="text-gray-600">Hectade {hectade}</p>
    //               </div>
    //               <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
    //                 <Button
    //                   onClick={() => openEditDialog(person)}
    //                   class="text-blue-600 hover:text-blue-800"
    //                 >
    //                   Edit
    //                 </Button>
    //                 <Button
    //                   onClick={() => handleRemovePerson(person.id)}
    //                   class="text-red-600 hover:text-red-800"
    //                 >
    //                   Remove
    //                 </Button>
    //               </div>
    //             </div>
    //           </div>
    //         );
    //       }}
    //     </For>

    //     {people().length === 0 && (
    //       <div class="text-center text-gray-500 mt-12">
    //         <p class="text-lg">No friends added yet.</p>
    //         <p class="text-sm mt-2">Click "Add Friend" to get started!</p>
    //       </div>
    //     )}
    //   </main>

    //   {/* Edit Dialog */}
    //   <Dialog
    //     open={editingPerson() !== null}
    //     onOpenChange={(open) => !open && setEditingPerson(null)}
    //   >
    //     <Dialog.Portal>
    //       <Dialog.Overlay class="fixed inset-0 bg-black/50" />
    //       <Dialog.Content class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg w-96">
    //         <Dialog.Title class="text-xl font-bold mb-4">
    //           Edit Friend
    //         </Dialog.Title>
    //         <Dialog.Description class="mb-4 text-gray-600">
    //           Update friend's details
    //         </Dialog.Description>

    //         <div class="space-y-4">
    //           <TextField value={editName()} onChange={setEditName}>
    //             <TextField.Label class="block text-sm font-medium mb-1">
    //               Name
    //             </TextField.Label>
    //             <TextField.Input
    //               class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    //               placeholder="Enter name"
    //             />
    //           </TextField>

    //           <TextField value={editBirthday()} onChange={setEditBirthday}>
    //             <TextField.Label class="block text-sm font-medium mb-1">
    //               Birthday
    //             </TextField.Label>
    //             <TextField.Input
    //               type="date"
    //               class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    //             />
    //           </TextField>
    //         </div>

    //         <div class="flex gap-2 mt-6">
    //           <Button
    //             onClick={handleEditPerson}
    //             class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    //           >
    //             Save
    //           </Button>
    //           <Dialog.CloseButton class="flex-1 px-4 py-2 border rounded hover:bg-gray-50">
    //             Cancel
    //           </Dialog.CloseButton>
    //         </div>
    //       </Dialog.Content>
    //     </Dialog.Portal>
    //   </Dialog>
    // </div>
  );
};

export default App;
