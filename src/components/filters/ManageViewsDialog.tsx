"use client";

import { Pencil, Plus, Settings, Trash2, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { FilterSet } from "@/types/filters";
import { FILTER_OPTIONS } from "@/types/filters";
import { useFilters } from "./FilterContext";

interface ManageViewsDialogProps {
  trigger?: React.ReactNode;
}

const ManageViewsDialog: React.FC<ManageViewsDialogProps> = ({ trigger }) => {
  const { filterState, createFilterSet, deleteFilterSet } = useFilters();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "list">("list");
  const [editingView, setEditingView] = useState<FilterSet | null>(null);

  // Form state
  const [viewName, setViewName] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setMode("list");
      setEditingView(null);
      setViewName("");
      setSelectedTeams([]);
      setSelectedRegions([]);
    }
  }, [open]);

  const handleCreateNew = () => {
    setMode("create");
    setViewName("");
    setSelectedTeams([]);
    setSelectedRegions([]);
  };

  const handleEditView = (view: FilterSet) => {
    setEditingView(view);
    setMode("create");
    setViewName(view.name);
    setSelectedTeams(view.filters.teams);
    setSelectedRegions(view.filters.regions);
  };

  const handleDeleteView = (viewId: string) => {
    const view = filterState.filterSets.find((fs) => fs.id === viewId);
    if (view && !view.isDefault) {
      deleteFilterSet(viewId);
    }
  };

  const handleSaveView = () => {
    if (!viewName.trim()) return;

    const filters = {
      teams: selectedTeams,
      regions: selectedRegions,
    };

    if (editingView) {
      // For editing, we'd need an update function - for now just create new
      createFilterSet(viewName.trim(), filters);
    } else {
      createFilterSet(viewName.trim(), filters);
    }

    // Reset and go back to list
    setMode("list");
    setViewName("");
    setSelectedTeams([]);
    setSelectedRegions([]);
    setEditingView(null);
  };

  const addTeam = (team: string) => {
    if (!selectedTeams.includes(team)) {
      setSelectedTeams([...selectedTeams, team]);
    }
  };

  const removeTeam = (team: string) => {
    setSelectedTeams(selectedTeams.filter((t) => t !== team));
  };

  const addRegion = (region: string) => {
    if (!selectedRegions.includes(region)) {
      setSelectedRegions([...selectedRegions, region]);
    }
  };

  const removeRegion = (region: string) => {
    setSelectedRegions(selectedRegions.filter((r) => r !== region));
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Settings className="h-4 w-4 mr-2" />
      Manage Views
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? editingView
                ? "Edit Filter View"
                : "Create Filter View"
              : "Manage Filter Views"}
          </DialogTitle>
        </DialogHeader>

        {mode === "list" ? (
          /* List Mode */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Manage your saved filter views
              </p>
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>

            <Separator />

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filterState.filterSets.map((view) => (
                <div
                  key={view.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{view.name}</h4>
                      {view.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {view.filters.teams.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-muted-foreground">
                            Teams:
                          </span>
                          {view.filters.teams.map((team) => (
                            <Badge
                              key={team}
                              variant="outline"
                              className="text-xs"
                            >
                              {team}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {view.filters.regions.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-muted-foreground">
                            Regions:
                          </span>
                          {view.filters.regions.map((region) => (
                            <Badge
                              key={region}
                              variant="outline"
                              className="text-xs"
                            >
                              {region}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {view.filters.teams.length === 0 &&
                        view.filters.regions.length === 0 && (
                          <span className="text-xs text-muted-foreground">
                            No filters
                          </span>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {!view.isDefault && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditView(view)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteView(view.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Create/Edit Mode */
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="view-name-input" className="text-sm font-medium">
                View Name
              </label>
              <Input
                id="view-name-input"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="e.g., Chen Lab Production, Development Team..."
                autoFocus
              />
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2 block">Teams</div>
                <div className="space-y-3">
                  <Select onValueChange={addTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add a team..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.teams
                        .filter((team) => !selectedTeams.includes(team))
                        .map((team) => (
                          <SelectItem key={team} value={team}>
                            {team}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {selectedTeams.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTeams.map((team) => (
                        <Badge
                          key={team}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeTeam(team)}
                        >
                          {team}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2 block">Regions</div>
                <div className="space-y-3">
                  <Select onValueChange={addRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add a region..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.regions
                        .filter((region) => !selectedRegions.includes(region))
                        .map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {selectedRegions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedRegions.map((region) => (
                        <Badge
                          key={region}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeRegion(region)}
                        >
                          {region}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setMode("list")}>
                Back
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewName("");
                    setSelectedTeams([]);
                    setSelectedRegions([]);
                  }}
                >
                  Clear
                </Button>
                <Button onClick={handleSaveView} disabled={!viewName.trim()}>
                  {editingView ? "Update View" : "Create View"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManageViewsDialog;
