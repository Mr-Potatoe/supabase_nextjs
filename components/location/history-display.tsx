"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Location } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Clock, Battery, Ruler, Calendar, ChevronDown, ChevronUp, Map } from "lucide-react";

interface HistoryDisplayProps {
  locationsByDate: Record<string, Location[]>;
  onViewLocation: (location: Location) => void;
}

export default function HistoryDisplay({ locationsByDate, onViewLocation }: HistoryDisplayProps) {
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("list");

  const toggleDateExpanded = (date: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const isDateExpanded = (date: string) => expandedDates[date] || false;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" /> Location History
        </CardTitle>
        <CardDescription>
          {Object.values(locationsByDate).flat().length} total location points
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pb-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Timeline
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <Map className="h-4 w-4" /> Stats
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="list" className="m-0">
            <ScrollArea className="h-[400px] px-6">
              <div className="space-y-4 py-2">
                {Object.keys(locationsByDate).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No location history found</p>
                  </div>
                ) : (
                  Object.entries(locationsByDate).map(([date, dateLocations]) => (
                    <div key={date} className="space-y-2">
                      <div 
                        className="flex items-center justify-between cursor-pointer hover:bg-muted p-2 rounded-md transition-colors"
                        onClick={() => toggleDateExpanded(date)}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-medium">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {dateLocations.length} points
                          </Badge>
                          {isDateExpanded(date) ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      
                      {isDateExpanded(date) && (
                        <div className="pl-6 space-y-2 animate-in fade-in-50 duration-300">
                          {dateLocations.map((location) => (
                            <div 
                              key={location.id} 
                              className="p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-primary" />
                                  <p className="text-sm font-medium">
                                    {format(new Date(location.recorded_at), 'h:mm a')}
                                  </p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={() => onViewLocation(location)}
                                >
                                  View
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Lat:</span>
                                  <span>{location.latitude.toFixed(6)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Lng:</span>
                                  <span>{location.longitude.toFixed(6)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Ruler className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Accuracy:</span>
                                  <span>{location.accuracy ? `${location.accuracy.toFixed(0)}m` : "Unknown"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Battery className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Battery:</span>
                                  <span>{location.battery_level ? `${(location.battery_level * 100).toFixed(0)}%` : "Unknown"}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="stats" className="m-0">
            <ScrollArea className="h-[400px] px-6">
              <div className="py-4 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Points</p>
                        <p className="text-lg font-semibold">{Object.values(locationsByDate).flat().length}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Days Tracked</p>
                        <p className="text-lg font-semibold">{Object.keys(locationsByDate).length}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">First Tracked</p>
                        <p className="text-sm font-medium">
                          {Object.keys(locationsByDate).length > 0 
                            ? format(new Date(Object.keys(locationsByDate)[Object.keys(locationsByDate).length - 1]), 'MMM d, yyyy')
                            : "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Last Tracked</p>
                        <p className="text-sm font-medium">
                          {Object.keys(locationsByDate).length > 0 
                            ? format(new Date(Object.keys(locationsByDate)[0]), 'MMM d, yyyy')
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}