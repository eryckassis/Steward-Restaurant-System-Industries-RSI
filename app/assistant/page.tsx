"use client";

import type React from "react";
import { useState } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Loader2, Download, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatbotConfigDialog } from "@/components/chatbot-config-dialog";
