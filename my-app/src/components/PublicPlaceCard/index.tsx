"use client";
import { useEffect, useState } from "react";

export default function PublicPlaceCard() {
  

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        {/* <div className="flex-shrink-0">
          <img
            src={location.image}
            alt={location.name}
            className="w-16 h-16 rounded-lg object-cover bg-gray-200"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
            {location.name}
          </h4>
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
            {location.address}
          </p>
        </div> */}
      </div>
      {/* {!isLast && (
        <div className="flex justify-center mt-3">
          <div className="w-px h-4 bg-gray-300"></div>
        </div>
      )} */}
    </div>
  );
}
