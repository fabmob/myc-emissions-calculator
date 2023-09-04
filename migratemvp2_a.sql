ALTER Table Projects RENAME TO _p;
CREATE Table Projects (id INTEGER PRIMARY KEY, createdDate STRING, modifiedDate STRING, owner STRING, name STRING, isSump INTEGER, country STRING, city STRING, partnerLocation STRING, area STRING, referenceYears STRING, status STRING, UNIQUE(owner, name));
INSERT INTO Projects (id, createdDate, modifiedDate, owner, name, isSump, country, city, partnerLocation, area, referenceYears, status) SELECT id, "1970-01-01", "1970-01-01", owner, name, isSump, country, city, partnerLocation, area, referenceYears, status FROM _p;
DROP Table _p;
