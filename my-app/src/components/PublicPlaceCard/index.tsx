"use client";
import { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { Text, Divider } from "@mantine/core";

export interface PlaceData {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  note?: string;
  photoUrl?: string;
  [key: string]: any; // 若你還會擴充更多欄位
}

export interface PlanDay {
  dayId: string;
  title: string;
  date: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  placesData: PlaceData[]; // 每天的景點
}

export interface PlanType {
  planId: string;
  userId: string;
  userName: string;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  name: string;
  note: string;
  startDate: string; // e.g. "2025-06-17"
  endDate: string; // e.g. "2025-06-21"
  totalDays: number;
  days: PlanDay[];
}

export default function PublicPlaceCard({ planData }: { planData: PlanType }) {
  return (
    <>
      <div className="mt-8 flex flex-col items-center justify-center">
        <div className="text-2xl font-medium mb-2">{planData.name}</div>
        <div className="text-lg text-gray-500 font-medium mb-2">
          {planData.note}
        </div>
        <div className="text-lg text-gray-500 font-medium">
          作者：{planData.userName}
        </div>
      </div>
      <Divider my="sm" className="my-4" />

      <div className="flex w-full gap-4  p-4 overflow-x-auto ">
        {planData.days.map((v: any, k: number) => {
          return (
            <div
              key={k}
              className="bg-white border border-gray-300 rounded-lg min-w-[400px] w-[400px] w-full flex flex-col px-4 "
            >
              <div className="text-center font-bold border-b py-2 mb-4">
                {v.dayId}
              </div>

              {v.placesData.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-4">
                  尚未安排行程
                </div>
              ) : (
                v.placesData.map((sv: any, sk: number) => (
                  <div key={sk}>
                    <div className="flex my-2 px-2 items-center justify-center">
                      <div className="flex-shrink-0 mr-2">
                        <img
                          src={sv.photoUrl}
                          className="w-16 h-16 rounded-lg object-cover bg-gray-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0 ">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {sv.name}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {sv.address}
                        </p>
                      </div>
                    </div>
                    <Divider my="sm" className="my-2" />
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
