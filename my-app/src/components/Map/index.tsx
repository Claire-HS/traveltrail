"use client";
import { useEffect, useRef, useState } from "react";
import SavePlaceToList from "@/components/SavePlaceToList";
import SavePlaceToPlan from "@/components/SavePlaceToPlan";

type PlaceData = {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
};

const center = { lat: 23.7, lng: 121.0 }; // 台灣中央

const MapWithPlaceAutocomplete = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const infoWindowInstance = useRef<google.maps.InfoWindow | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveType, setSaveType] = useState<"list" | "plan" | null>(null);

  useEffect(() => {
    let destroyed = false;
    const initMap = async () => {
      if (destroyed || mapInstance.current) return;
      //@ts-ignore
      const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
        google.maps.importLibrary("maps") as Promise<typeof google.maps>,
        google.maps.importLibrary("marker") as Promise<typeof google.maps>,
      ]);

      // Create map
      const map = new Map(mapRef.current as HTMLElement, {
        center,
        zoom: 7,
        mapId: "4504f8b37365c3d0",
        mapTypeControl: false,
      });

      mapInstance.current = map;

      // Create marker
      const marker = new AdvancedMarkerElement({
        map,
      });
      markerInstance.current = marker;

      // Info window
      const infoWindow = new google.maps.InfoWindow();
      infoWindowInstance.current = infoWindow;

      // 插入 autocomplete 元素前先清掉殘留的
      const existing = cardRef.current?.querySelector("gmp-place-autocomplete");
      if (existing) existing.remove();

      // Create Place Autocomplete Element
      const placeAutocomplete =
        //@ts-ignore
        new google.maps.places.PlaceAutocompleteElement();
      placeAutocomplete.id = "place-autocomplete-input";
      placeAutocomplete.locationBias = center;

      cardRef.current?.appendChild(placeAutocomplete);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(cardRef.current!);

      // Listen to place selection
      placeAutocomplete.addEventListener(
        "gmp-select",
        //@ts-ignore
        async ({ placePrediction }) => {
          const place = placePrediction.toPlace();

          await place.fetchFields({
            fields: [
              "id",
              "displayName",
              "formattedAddress",
              "location",
              "viewport",
              "photos",
              "rating",
              "userRatingCount",
              "websiteURI",
              "googleMapsURI",
            ],
          });

          if (place.viewport) {
            map.fitBounds(place.viewport);
          } else if (place.location) {
            map.setCenter(place.location);
            map.setZoom(11);
          }

          marker.position = place.location;

          const firstPhoto = place.photos?.[0];
          let photoSrc = "";

          if (firstPhoto) {
            const photoName = firstPhoto.name;
            photoSrc = `/api/placepic?photoName=${encodeURIComponent(
              photoName
            )}&maxWidth=400`;
          }

          const content = `
              <div id="infowindow-content" style="width:320px">
                  <img src="${photoSrc}" alt="Place photo" style="width: 320px; height: 225px; object-fit: cover;  border-radius: 8px; margin-bottom: 8px; display: block; margin-left: auto; margin-right: auto;" />
                  <div style="margin:8px 0 4px;font-size:18px; font-weight: 700">${
                    place.displayName ?? "N/A"
                  }</div>
                  <div style="color:#555; margin-bottom:6px; font-weight: 500">${
                    place.formattedAddress ?? "N/A"
                  }</div>
                  <div style="margin-bottom:6px;font-weight: 500">
                  評分: ${place.rating ?? "無"} / 5 (共${
            place.userRatingCount?.toLocaleString() ?? "N/A"
          } 則評論)
                  </div>
                  ${
                    place.websiteURI
                      ? `<div><a href="${place.websiteURI}" target="_blank" rel="noopener noreferrer" style="color:#1a73e8;font-weight: 500">前往官方網站</a></div>`
                      : ""
                  }
                  ${
                    place.googleMapsURI
                      ? `<div><a href="${place.googleMapsURI}" target="_blank" rel="noopener noreferrer" style="color:#1a73e8;font-weight: 500">前往 Google Maps 查看</a></div>`
                      : ""
                  }
                  <div style="display:flex; justify-content:space-between">
                    <button id="toList-btn" style="margin-top:8px;padding:6px 12px;border:none;border-radius:8px;background:#2C3E50;color:#FAF3EB; font-size:16px; font-weight:700;cursor:pointer">
                        加入收藏
                    </button>
                    <button id="toPlan-btn" style="margin-top:8px;padding:6px 12px;border:none;border-radius:8px;background:#2C3E50;color:#FAF3EB; font-size:16px; font-weight:700; cursor:pointer">
                        加入行程
                    </button>
                  </div>
                

              </div>
            `;

          infoWindow.setContent(content);
          infoWindow.setPosition(place.location);
          infoWindow.open({ map, anchor: marker, shouldFocus: false });

          setTimeout(() => {
            const saveToListBtn = document.getElementById("toList-btn");
            const saveToPlanBtn = document.getElementById("toPlan-btn");

            if (saveToListBtn) {
              saveToListBtn.addEventListener("click", async () => {
                const placeData = {
                  id: place.id,
                  name: place.displayName,
                  address: place.formattedAddress,
                  location: place.location.toJSON(),
                  photoName: place.photos?.[0]?.name ?? null, // 傳 photoName 而非上傳結果
                };

                setSelectedPlace(placeData);
                setSaveType("list");
                setShowSaveModal(true);
              });
            }

            if (saveToPlanBtn) {
              saveToPlanBtn.addEventListener("click", async () => {
                const placeData = {
                  id: place.id,
                  name: place.displayName,
                  address: place.formattedAddress,
                  location: place.location.toJSON(),
                  photoName: place.photos?.[0]?.name ?? null,
                };
                setSelectedPlace(placeData);
                setSaveType("plan");
                setShowSaveModal(true);
              });
            }
          }, 0);
        }
      );
    };

    initMap();
    return () => {
      destroyed = true;

      // Remove autocomplete element(s)
      const inputs = cardRef.current?.querySelectorAll(
        "gmp-place-autocomplete"
      );
      inputs?.forEach((el) => el.remove());

      // Cleanup references
      mapInstance.current = null;
      markerInstance.current = null;
      infoWindowInstance.current = null;
    };
  }, []);

  return (
    <div className="h-full w-full">
      <div
        ref={cardRef}
        id="place-autocomplete-card"
        className="p-1 w-full max-w-xs mt-2 ml-2 mx-auto bg-white shadow-md rounded-md"
      />
      <div ref={mapRef} id="map" className="h-[calc(100vh-160px)] w-full" />

      {saveType === "list" ? (
        <SavePlaceToList
          placeData={selectedPlace}
          opened={showSaveModal}
          onClose={() => {
            setShowSaveModal(false);
            setSelectedPlace(null);
            setSaveType(null);
          }}
        />
      ) : (
        <SavePlaceToPlan
          placeData={selectedPlace}
          opened={showSaveModal}
          onClose={() => {
            setShowSaveModal(false);
            setSelectedPlace(null);
            setSaveType(null);
          }}
        />
      )}
    </div>
  );
};

export default MapWithPlaceAutocomplete;
