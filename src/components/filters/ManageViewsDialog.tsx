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
  const { filterState, createFilterSet, updateFilterSet, deleteFilterSet } =
    useFilters();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "list">("list");
  const [editingView, setEditingView] = useState<FilterSet | null>(null);

  // Form state
  const [viewName, setViewName] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedWasteLevel, setSelectedWasteLevel] = useState<string[]>([]);
  const [selectedInstanceTypes, setSelectedInstanceTypes] = useState<string[]>(
    [],
  );
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [teamSelectValue, setTeamSelectValue] = useState("");
  const [regionSelectValue, setRegionSelectValue] = useState("");
  const [wasteLevelSelectValue, setWasteLevelSelectValue] = useState("");
  const [instanceTypeSelectValue, setInstanceTypeSelectValue] = useState("");
  const [statusSelectValue, setStatusSelectValue] = useState("");
  const [jobIdSelectValue, setJobIdSelectValue] = useState("");

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setMode("list");
      setEditingView(null);
      setViewName("");
      setSelectedTeams([]);
      setSelectedRegions([]);
      setSelectedWasteLevel([]);
      setSelectedInstanceTypes([]);
      setSelectedStatus([]);
      setSelectedJobIds([]);
      setTeamSelectValue("");
      setRegionSelectValue("");
      setWasteLevelSelectValue("");
      setInstanceTypeSelectValue("");
      setStatusSelectValue("");
      setJobIdSelectValue("");
    }
  }, [open]);

  const handleCreateNew = () => {
    setMode("create");
    setViewName("");
    setSelectedTeams([]);
    setSelectedRegions([]);
    setSelectedWasteLevel([]);
    setSelectedInstanceTypes([]);
    setSelectedStatus([]);
    setSelectedJobIds([]);
    setTeamSelectValue("");
    setRegionSelectValue("");
    setWasteLevelSelectValue("");
    setInstanceTypeSelectValue("");
    setStatusSelectValue("");
    setJobIdSelectValue("");
  };

  const handleEditView = (view: FilterSet) => {
    setEditingView(view);
    setMode("create");
    setViewName(view.name);
    setSelectedTeams(view.filters.teams || []);
    setSelectedRegions(view.filters.regions || []);
    setSelectedWasteLevel(view.filters.wasteLevel || []);
    setSelectedInstanceTypes(view.filters.instanceTypes || []);
    setSelectedStatus(view.filters.status || []);
    setSelectedJobIds(view.filters.jobIds || []);
    setTeamSelectValue("");
    setRegionSelectValue("");
    setWasteLevelSelectValue("");
    setInstanceTypeSelectValue("");
    setStatusSelectValue("");
    setJobIdSelectValue("");
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
      wasteLevel: selectedWasteLevel,
      instanceTypes: selectedInstanceTypes,
      status: selectedStatus,
      jobIds: selectedJobIds,
    };

    if (editingView) {
      // Update existing filter set
      updateFilterSet(editingView.id, viewName.trim(), filters);
    } else {
      createFilterSet(viewName.trim(), filters);
    }

    // Reset and go back to list
    setMode("list");
    setViewName("");
    setSelectedTeams([]);
    setSelectedRegions([]);
    setSelectedWasteLevel([]);
    setSelectedInstanceTypes([]);
    setSelectedStatus([]);
    setSelectedJobIds([]);
    setTeamSelectValue("");
    setRegionSelectValue("");
    setWasteLevelSelectValue("");
    setInstanceTypeSelectValue("");
    setStatusSelectValue("");
    setJobIdSelectValue("");
    setEditingView(null);
  };

  const addTeam = (team: string) => {
    if (!selectedTeams.includes(team)) {
      setSelectedTeams([...selectedTeams, team]);
    }
    setTeamSelectValue(""); // Reset the select value
  };

  const removeTeam = (team: string) => {
    setSelectedTeams(selectedTeams.filter((t) => t !== team));
  };

  const addRegion = (region: string) => {
    if (!selectedRegions.includes(region)) {
      setSelectedRegions([...selectedRegions, region]);
    }
    setRegionSelectValue(""); // Reset the select value
  };

  const removeRegion = (region: string) => {
    setSelectedRegions(selectedRegions.filter((r) => r !== region));
  };

  const addWasteLevel = (wasteLevel: string) => {
    if (!selectedWasteLevel.includes(wasteLevel)) {
      setSelectedWasteLevel([...selectedWasteLevel, wasteLevel]);
    }
    setWasteLevelSelectValue("");
  };

  const removeWasteLevel = (wasteLevel: string) => {
    setSelectedWasteLevel(selectedWasteLevel.filter((w) => w !== wasteLevel));
  };

  const addInstanceType = (instanceType: string) => {
    if (!selectedInstanceTypes.includes(instanceType)) {
      setSelectedInstanceTypes([...selectedInstanceTypes, instanceType]);
    }
    setInstanceTypeSelectValue("");
  };

  const removeInstanceType = (instanceType: string) => {
    setSelectedInstanceTypes(
      selectedInstanceTypes.filter((i) => i !== instanceType),
    );
  };

  const addStatus = (status: string) => {
    if (!selectedStatus.includes(status)) {
      setSelectedStatus([...selectedStatus, status]);
    }
    setStatusSelectValue("");
  };

  const removeStatus = (status: string) => {
    setSelectedStatus(selectedStatus.filter((s) => s !== status));
  };

  const addJobId = (jobId: string) => {
    if (!selectedJobIds.includes(jobId)) {
      setSelectedJobIds([...selectedJobIds, jobId]);
    }
    setJobIdSelectValue("");
  };

  const removeJobId = (jobId: string) => {
    setSelectedJobIds(selectedJobIds.filter((j) => j !== jobId));
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Settings className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">Manage Views</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Manage your saved filter views
              </p>
              <Button
                onClick={handleCreateNew}
                size="sm"
                className="self-start sm:self-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>

            <Separator />

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filterState.filterSets.map((view) => (
                <div
                  key={view.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{view.name}</h4>
                      {view.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1 mt-1">
                      {/* First row - Teams and Regions */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                        {view.filters.teams.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              Teams:
                            </span>
                            {view.filters.teams.map((team) => (
                              <Badge
                                key={team}
                                variant="outline"
                                className="text-xs border-border"
                              >
                                {team}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {view.filters.regions.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              Regions:
                            </span>
                            {view.filters.regions.map((region) => (
                              <Badge
                                key={region}
                                variant="outline"
                                className="text-xs border-border"
                              >
                                {region}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Second row - New filter types */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 flex-wrap">
                        {view.filters.wasteLevel.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              Waste:
                            </span>
                            {view.filters.wasteLevel.map((waste) => (
                              <Badge
                                key={waste}
                                variant="outline"
                                className="text-xs border-border"
                              >
                                {waste}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {view.filters.instanceTypes.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              Types:
                            </span>
                            {view.filters.instanceTypes.map((type) => (
                              <Badge
                                key={type}
                                variant="outline"
                                className="text-xs border-border"
                              >
                                {type}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {view.filters.status.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              Status:
                            </span>
                            {view.filters.status.map((status) => (
                              <Badge
                                key={status}
                                variant="outline"
                                className="text-xs border-border"
                              >
                                {status}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {view.filters.jobIds.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              Jobs:
                            </span>
                            {view.filters.jobIds.map((jobId) => (
                              <Badge
                                key={jobId}
                                variant="outline"
                                className="text-xs border-border"
                              >
                                {jobId}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* No filters message */}
                      {view.filters.teams.length === 0 &&
                        view.filters.regions.length === 0 &&
                        view.filters.wasteLevel.length === 0 &&
                        view.filters.instanceTypes.length === 0 &&
                        view.filters.status.length === 0 &&
                        view.filters.jobIds.length === 0 && (
                          <span className="text-xs text-muted-foreground">
                            No filters
                          </span>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 self-start sm:self-center">
                    {!view.isDefault && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditView(view)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteView(view.id)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
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
                  <Select value={teamSelectValue} onValueChange={addTeam}>
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
                  <Select value={regionSelectValue} onValueChange={addRegion}>
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

              <div>
                <div className="text-sm font-medium mb-2 block">
                  Waste Level
                </div>
                <div className="space-y-3">
                  <Select
                    value={wasteLevelSelectValue}
                    onValueChange={addWasteLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add a waste level..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.wasteLevel
                        .filter((waste) => !selectedWasteLevel.includes(waste))
                        .map((waste) => (
                          <SelectItem key={waste} value={waste}>
                            {waste}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {selectedWasteLevel.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedWasteLevel.map((waste) => (
                        <Badge
                          key={waste}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeWasteLevel(waste)}
                        >
                          {waste}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2 block">
                  Instance Types
                </div>
                <div className="space-y-3">
                  <Select
                    value={instanceTypeSelectValue}
                    onValueChange={addInstanceType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add an instance type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.instanceTypes
                        .filter((type) => !selectedInstanceTypes.includes(type))
                        .map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {selectedInstanceTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedInstanceTypes.map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeInstanceType(type)}
                        >
                          {type}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2 block">Status</div>
                <div className="space-y-3">
                  <Select value={statusSelectValue} onValueChange={addStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add a status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.status
                        .filter((status) => !selectedStatus.includes(status))
                        .map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {selectedStatus.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedStatus.map((status) => (
                        <Badge
                          key={status}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeStatus(status)}
                        >
                          {status}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2 block">Job ID</div>
                <div className="space-y-3">
                  <Select value={jobIdSelectValue} onValueChange={addJobId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add a job ID..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.jobIds
                        .filter((jobId) => !selectedJobIds.includes(jobId))
                        .map((jobId) => (
                          <SelectItem key={jobId} value={jobId}>
                            {jobId}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {selectedJobIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedJobIds.map((jobId) => (
                        <Badge
                          key={jobId}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeJobId(jobId)}
                        >
                          {jobId}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setMode("list")}
                className="order-2 sm:order-1"
              >
                Back
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewName("");
                    setSelectedTeams([]);
                    setSelectedRegions([]);
                    setSelectedWasteLevel([]);
                    setSelectedInstanceTypes([]);
                    setSelectedStatus([]);
                    setSelectedJobIds([]);
                    setTeamSelectValue("");
                    setRegionSelectValue("");
                    setWasteLevelSelectValue("");
                    setInstanceTypeSelectValue("");
                    setStatusSelectValue("");
                    setJobIdSelectValue("");
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
