import { Coins, Sparkles, Zap, ChartPie, Gem } from "lucide-react";
import React from "react";
import { getUserCredits } from "~/actions/tts";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

const Credits = async () => {
  const result = await getUserCredits();

  const credits = result.success ? result.credits : 0;

  return (
    <SidebarGroup className="mt-auto">
      <SidebarMenu>
        <SidebarMenuItem>
          <div
            className="group/credits relative flex w-full flex-col overflow-hidden rounded-xl bg-gradient-to-br from-brand-dark via-brand to-brand-light p-0.5 text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            <div className="relative flex w-full items-center gap-3 bg-white/5 p-3 backdrop-blur-sm">
                
                {/* Highlight Glow Effect */}
                <div className="absolute -left-4 -top-10 h-24 w-24 animate-pulse rounded-full bg-brand-light/30 blur-2xl group-hover/credits:bg-brand-lighter/40"></div>
                
                {/* Icon Section */}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 shadow-inner ring-1 ring-white/30 transition-transform group-hover/credits:rotate-3">
                    <Gem className="relative z-10 h-5 w-5 text-white drop-shadow-md" />
                    <Sparkles className="absolute -right-1 -top-1 h-3 w-3 animate-bounce text-yellow-300 opacity-0 transition-opacity duration-700 group-hover/credits:opacity-100" />
                </div>

                {/* Text Content */}
                <div className="flex flex-1 flex-col z-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 group-hover/credits:text-white transition-colors">
                        Credits
                    </span>
                    <div className="flex items-center gap-1 font-mono text-xl font-bold leading-none tracking-tight text-white drop-shadow-sm">
                        {credits}
                        <Zap className="h-3 w-3 animate-pulse text-yellow-400 fill-yellow-400" />
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
                <Coins className="absolute -bottom-2 -right-2 h-12 w-12 text-white/5 rotate-12 group-hover/credits:scale-110 transition-transform" />

            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default Credits;
