ALTER Table ProjectSteps RENAME TO _p;
CREATE Table ProjectSteps (projectId INTEGER, stage STRING, stageId INTEGER, stepNumber INTEGER, value STRING, FOREIGN KEY(projectId) REFERENCES Projects(id),  UNIQUE(projectId, stage, stageId, stepNumber) ON CONFLICT REPLACE);
INSERT INTO ProjectSteps (projectId, stage, stageId, stepNumber, value) SELECT projectId, "Inventory", 0, stepNumber, value FROM _p;
DROP Table _p;
