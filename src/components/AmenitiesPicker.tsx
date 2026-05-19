import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { AMENITY_I18N_KEY, LISTING_AMENITY_OPTIONS, sortAmenitiesSelected } from "@/lib/amenities";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  label?: string;
  options?: readonly string[];
};

function amenityLabel(t: (k: string) => string, canonical: string) {
  const slug = AMENITY_I18N_KEY[canonical as keyof typeof AMENITY_I18N_KEY];
  if (!slug) return canonical;
  return t(`amenities.values.${slug}`);
}

export function AmenitiesPicker({
  value,
  onChange,
  disabled,
  label,
  options = LISTING_AMENITY_OPTIONS,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const toggle = (label: string) => {
    onChange(value.includes(label) ? value.filter((x) => x !== label) : [...value, label]);
  };

  const remove = (label: string) => {
    onChange(value.filter((x) => x !== label));
  };

  const selectedInOptions = value.filter((item) => options.includes(item));
  const sorted = sortAmenitiesSelected(selectedInOptions);

  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium text-muted-foreground">
        {label ?? t("amenities.label")}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="h-10 w-full justify-between rounded-lg border-input bg-background font-normal text-foreground hover:bg-accent/50"
          >
            <span
              className={cn("truncate", selectedInOptions.length === 0 && "text-muted-foreground")}
            >
              {selectedInOptions.length === 0
                ? t("amenities.select")
                : t("amenities.selectedCount", { count: selectedInOptions.length })}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={t("amenities.search")} className="h-9" />
            <CommandList>
              <CommandEmpty>{t("amenities.empty")}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const selected = value.includes(opt);
                  const display = amenityLabel(t, opt);
                  return (
                    <CommandItem
                      key={opt}
                      value={opt}
                      keywords={[display]}
                      onSelect={() => toggle(opt)}
                      className={cn(
                        "cursor-pointer gap-2",
                        selected && "bg-primary/8 text-foreground dark:bg-primary/15",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border",
                          selected && "border-primary bg-primary text-primary-foreground",
                        )}
                      >
                        {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span className="flex-1">{display}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {sorted.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {sorted.map((label) => (
            <span
              key={label}
              className="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-muted/50 py-1 pl-2.5 pr-1 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted dark:bg-muted/30 dark:hover:bg-muted/50"
            >
              <span className="truncate">{amenityLabel(t, label)}</span>
              <button
                type="button"
                onClick={() => remove(label)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                aria-label={t("amenities.remove", { label: amenityLabel(t, label) })}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
