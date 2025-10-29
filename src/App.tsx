import { Button } from "@kobalte/core/button";
import { Dialog } from "@kobalte/core/dialog";
import { TextField } from "@kobalte/core/text-field";
import {
  type Component,
  createEffect,
  createSignal,
  For,
  on,
  onCleanup,
  onMount,
} from "solid-js";
import SvgFilters from "./AppSvgFilters";
import Background from "./Background";
import {
  createRoundedRectDisplacementMap,
  generateDisplacementArray,
  imageDataToDataURL,
} from "./glassPhysics";

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
  const [people, setPeople] = createSignal<Person[]>([]);
  const [newName, setNewName] = createSignal("");
  const [newBirthday, setNewBirthday] = createSignal("");
  const [isAddDialogOpen, setIsAddDialogOpen] = createSignal(false);

  const [editingPerson, setEditingPerson] = createSignal<Person | null>(null);
  const [editName, setEditName] = createSignal("");
  const [editBirthday, setEditBirthday] = createSignal("");

  const [headerDataURL, setHeaderDataURL] = createSignal("");
  const [bezelWidth] = createSignal(0.3);
  const [glassThickness] = createSignal(50);
  const [scale] = createSignal(30);

  const headerFilterId = "liquidGlassHeaderFilter";
  let headerEl: HTMLElement | undefined;
  const [hdrW, setHdrW] = createSignal(0);
  const [hdrH, setHdrH] = createSignal(80); // initial height matches h-20

  onMount(() => {
    if (!headerEl) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setHdrW(Math.round(rect.width));
      setHdrH(Math.round(rect.height));
    });
    ro.observe(headerEl);
    onCleanup(() => ro.disconnect());
  });

  createEffect(
    on([bezelWidth, glassThickness, hdrW, hdrH], () => {
      if (hdrW() <= 0 || hdrH() <= 0) return;
      const data = generateDisplacementArray(
        127,
        bezelWidth(),
        glassThickness(),
      );
      const radius = Math.floor(hdrH() / 2); // pill: half the height
      const img = createRoundedRectDisplacementMap(
        hdrW(),
        hdrH(),
        radius,
        data,
      );
      setHeaderDataURL(imageDataToDataURL(img));
    }),
  );

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
    <div class="min-h-screen bg-gray-50">
      <SvgFilters
        filterId="circleFilter"
        dataURL=""
        circleSize={0}
        scale={scale()}
        headerFilterId={headerFilterId}
        headerDataURL={headerDataURL()}
        headerWidth={hdrW()}
        headerHeight={hdrH()}
      />

      <Background
        useImage={true}
        imageURL="https://www.nao.ac.jp/en/contents/news/science/2021/20210910-cfca-fig3-full.jpg"
      />
      <div class="relative">
        {/* Header */}
        <header
          ref={(el) => (headerEl = el)}
          class="relative mx-auto mt-6 w-[min(92vw,1000px)] h-20"
        >
          <div
            class="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.25)",
              "box-shadow": "0 8px 24px rgba(0,0,0,0.15)",
              "backdrop-filter": `url(#${headerFilterId})`,
              "-webkit-backdrop-filter": `url(#${headerFilterId})`,
            }}
          />
          <div class="relative h-full px-6 flex items-center justify-between">
            <h1 class="text-2xl text-white font-bold">Hectade Calendar</h1>
            <Dialog open={isAddDialogOpen()} onOpenChange={setIsAddDialogOpen}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  aria-label="Add friend"
                  class="relative flex items-center justify-center w-12 h-12 rounded-full border shadow-lg transition active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.12)", // translucent fill
                    "backdrop-filter": "blur(10px)", // matte glass blur
                    "-webkit-backdrop-filter": "blur(10px)", // Safari
                    border: "1px solid rgba(255,255,255,0.25)", // subtle border
                    "box-shadow": "0 4px 14px rgba(0,0,0,0.15)", // soft shadow
                  }}
                  // optional hover states via inline style are clunky; Tailwind example below
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    class="text-white/90"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </Dialog.Trigger>

              {/* keep your Dialog.Portal and Content exactly as-is */}
              <Dialog.Portal>
                <Dialog.Overlay class="fixed inset-0 bg-black/50" />
                <Dialog.Content class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg w-96">
                  <Dialog.Title class="text-xl font-bold mb-4">
                    Add Friend
                  </Dialog.Title>
                  <Dialog.Description class="mb-4 text-gray-600">
                    Add a friend's name and birthday
                  </Dialog.Description>

                  <div class="space-y-4">
                    <TextField value={newName()} onChange={setNewName}>
                      <TextField.Label class="block text-sm font-medium mb-1">
                        Name
                      </TextField.Label>
                      <TextField.Input
                        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter name"
                      />
                    </TextField>

                    <TextField value={newBirthday()} onChange={setNewBirthday}>
                      <TextField.Label class="block text-sm font-medium mb-1">
                        Birthday
                      </TextField.Label>
                      <TextField.Input
                        type="date"
                        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </TextField>
                  </div>

                  <div class="flex gap-2 mt-6">
                    <Button
                      onClick={handleAddPerson}
                      class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add
                    </Button>
                    <Dialog.CloseButton class="flex-1 px-4 py-2 border rounded hover:bg-gray-50">
                      Cancel
                    </Dialog.CloseButton>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog>
          </div>
        </header>

        {/* Main content */}
        <main class="container mx-auto p-6">
          <For each={people()}>
            {(person) => {
              const dayNumber = calculateDayNumber(person.birthday);
              const hectade = Math.floor(dayNumber / 100);

              return (
                <div class="bg-white rounded-lg shadow p-6 mb-4 group">
                  <div class="flex justify-between items-start">
                    <div>
                      <h2 class="text-xl font-semibold mb-2">{person.name}</h2>
                      <p class="text-gray-600">
                        Day {dayNumber.toLocaleString()} of life
                      </p>
                      <p class="text-gray-600">Hectade {hectade}</p>
                    </div>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => openEditDialog(person)}
                        class="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleRemovePerson(person.id)}
                        class="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>

          {people().length === 0 && (
            <div class="text-center text-gray-500 mt-12">
              <p class="text-lg">No friends added yet.</p>
              <p class="text-sm mt-2">Click "Add Friend" to get started!</p>
            </div>
          )}
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editingPerson() !== null}
        onOpenChange={(open) => !open && setEditingPerson(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay class="fixed inset-0 bg-black/50" />
          <Dialog.Content class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg w-96">
            <Dialog.Title class="text-xl font-bold mb-4">
              Edit Friend
            </Dialog.Title>
            <Dialog.Description class="mb-4 text-gray-600">
              Update friend's details
            </Dialog.Description>

            <div class="space-y-4">
              <TextField value={editName()} onChange={setEditName}>
                <TextField.Label class="block text-sm font-medium mb-1">
                  Name
                </TextField.Label>
                <TextField.Input
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter name"
                />
              </TextField>

              <TextField value={editBirthday()} onChange={setEditBirthday}>
                <TextField.Label class="block text-sm font-medium mb-1">
                  Birthday
                </TextField.Label>
                <TextField.Input
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </TextField>
            </div>

            <div class="flex gap-2 mt-6">
              <Button
                onClick={handleEditPerson}
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </Button>
              <Dialog.CloseButton class="flex-1 px-4 py-2 border rounded hover:bg-gray-50">
                Cancel
              </Dialog.CloseButton>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </div>
  );
};

export default App;
