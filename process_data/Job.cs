using System.Collections.Generic;

namespace albi
{
    public class Job : NodeAttribute {
        
        public static HashSet<Job> ALL = new HashSet<Job> {
            new Job {
                Code = "EMPTY",
                Name = "EMPTY",
                Category = "EMPTY",
                Color = "#000000"
            },
            new Job {
                Code = "AF", 
                Name = "Ouvriers",
                Category = "Ouvriers",
                Color = "#ced0d0",
            },
            new Job {
                Code = "BAS",
                Name = "Tondeur de draps",
                Category = "Métiers du textile et de l’habillement, petit équipement",
                Color = "#585858"
            },
            new Job {
                Code = "CTR", 
                Name = "Couturier",
                Category = "Métiers du textile et de l’habillement, petit équipement",
                Color = "#585858"
            },
            new Job {
                Code = "PAR",
                Name = "Foulon",
                Category = "Métiers du textile et de l’habillement, petit équipement",
                Color = "#585858"
            },
            new Job {
                Code = "FAB",
                Name = "Forgeron",
                Category = "Métiers du bâtiment",
                Color = "#585858"
            },
            new Job {
                Code = "TU",
                Name = "Tuiler",
                Category = "Métiers du bâtiment",
                Color = "#585858"
            },
            new Job {
                Code = "SAV",
                Name = "Cordonnier",
                Category = "Métiers du textile et de l’habillement, petit équipement",
                Color = "#585858"
            },
            new Job {
                Code = "SRT",
                Name = "Tailleur",
                Category = "Métiers du textile et de l’habillement, petit équipement",
                Color = "#585858"
            },
            new Job {
                Code = "TT",
                Name = "Teinturier",
                Category = "Métiers du textile et de l’habillement, petit équipement",
                Color = "#585858"
            },
            new Job {
                Code = "MAG",
                Name = "Mager de drap",
                Category = "Métiers du textile et de l’habillement, petit équipement",
                Color = "#585858"
            },
            new Job {
                Code = "COT",
                Name = "Coutelier",
                Category = "Métiers du textile et de l’habillement, petit équipement",
                Color = "#585858"
            },
            new Job {
                Code = "MAC",
                Name = "Maçon",
                Category = "Métiers du bâtiment",
                Color = "#00e130",
            },
            new Job {
                Code = "SAR",
                Name = "Serrurier",
                Category = "Métiers du bâtiment",
                Color = "#00e130",
            },
            new Job {
                Code = "FUS",
                Name = "Fustier",
                Category = "Métiers du bâtiment",
                Color = "#00e130",
            },
            new Job {
                Code = "HOS",
                Name = "Hôtelier",
                Category = "Métiers du commerce",
                Color = "#0044e1"
            },
            new Job {
                Code = "MAR",
                Name = "Marchand",
                Category = "Métiers du commerce",
                Color = "#0044e1"
            },
            new Job {
                Code = "AP",
                Name = "Apothicaire",
                Category = "Métiers du commerce",
                Color = "#0044e1"
            },
            new Job {
                Code = "IT",
                Name = "Colporteur",
                Category = "Métiers du commerce",
                Color = "#0044e1"
            },
            new Job {
                Code = "PENT",
                Name = "Pontonnier",
                Category = "Métiers du transport",
                Color = "#5ec3fc",
            },
            new Job {
                Code = "BAST",
                Name = "Bourrelier",
                Category = "Métiers du transport",
                Color = "#5ec3fc",
            },
            new Job {
                Code = "MAS",
                Name = "Boucher",
                Category = "Boucher",
                Color = "#9305fc",
            },
            new Job {
                Code = "NOT",
                Name = "Notaire",
                Category = "Métiers du droit et de l'écrit",
                Color = "#fc1405",
            },
            new Job {
                Code = "CLE",
                Name = "Clerc",
                Category = "Métiers du droit et de l'écrit",
                Color = "#fc1405",
            },
            new Job {
                Code = "REC",
                Name = "Curé",
                Category = "Clercs réguliers et séculiers",
                Color = "#ff008b",
            },
            new Job {
                Code = "REL",
                Name = "Religieux régulier",
                Category = "Clercs réguliers et séculiers",
                Color = "#ff008b",
            },
        };

    }
}
