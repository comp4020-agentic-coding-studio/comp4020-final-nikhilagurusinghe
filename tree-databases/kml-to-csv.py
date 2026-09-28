#!/usr/bin/env python3
"""Convert the ANU tree database KML into a flat CSV.

Each <Placemark> becomes one row: the containing <Folder> name, the placemark
name (tree ID), every <ExtendedData> field, and the <Point> coordinates split
into separate latitude/longitude columns.

Usage: python3 kml-to-csv.py [input.kml] [output.csv]
"""

import csv
import sys
import xml.etree.ElementTree as ET

KML_NS = "{http://www.opengis.net/kml/2.2}"

# The 15 ExtendedData fields, in the order they appear in the source.
DATA_FIELDS = [
    "Genus Species",
    "Common Name",
    "Height",
    "Crown Radius",
    "DBH",
    "Tree Age",
    "SIGNIFICANCE",
    "Tree Health",
    "Tree Structure",
    "ULE",
    "Habitat",
    "Classification",
    "GPS COORDS",
    "Comments",
    "OTHER OBSERVATIONS",
]

HEADER = ["Layer", "Tree ID"] + DATA_FIELDS + ["Longitude", "Latitude"]


def text_of(element):
    return element.text.strip() if element is not None and element.text else ""


def rows(kml_path):
    """Yield one row per Placemark, in document order."""
    for folder in ET.parse(kml_path).getroot().iter(f"{KML_NS}Folder"):
        layer = text_of(folder.find(f"{KML_NS}name"))

        for placemark in folder.iterfind(f"{KML_NS}Placemark"):
            row = {
                "Layer": layer,
                "Tree ID": text_of(placemark.find(f"{KML_NS}name")),
            }

            for data in placemark.iterfind(
                f"{KML_NS}ExtendedData/{KML_NS}Data"
            ):
                row[data.get("name")] = text_of(data.find(f"{KML_NS}value"))

            coords = text_of(
                placemark.find(f"{KML_NS}Point/{KML_NS}coordinates")
            )
            if coords:
                lon, lat = coords.split(",")[:2]
                row["Longitude"], row["Latitude"] = lon, lat

            yield row


def main():
    kml_path = sys.argv[1] if len(sys.argv) > 1 else "ANU tree database 2024.kml"
    csv_path = sys.argv[2] if len(sys.argv) > 2 else "ANU tree database 2024.csv"

    with open(csv_path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=HEADER, restval="")
        writer.writeheader()

        count = 0
        for row in rows(kml_path):
            writer.writerow(row)
            count += 1

    print(f"Wrote {count} rows to {csv_path}")


if __name__ == "__main__":
    main()
