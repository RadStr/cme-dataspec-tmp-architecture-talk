# cme-dataspec-tmp-architecture-talk


## CME-v2:
### Shrnutí
1) Vytvořim callbacky
2) Kontext pro registrování akcí, kde jsou prozatím defaultní akce + tomu se předají callbacky z venku jako parametry
3) Kontext dám controlleru, který vytváří skutečný akce (vůči API) a ty zaregistruju + controller má navíc specifický reactflow akce
4) Controller je ts soubor, podle něho nastavim reactí komponentu představující diagram.

### Otázky:
1) Takže všechny (i ty specifcký reactflow akce) budou pracovat jen s tim diagram API a na reactflow operace se vůbec nebude šahat?
2) Takže pro mě to asi hlavně znamená, že budu pracovat s tím novým API místo přímo s reactflow
3) Na čem všem v rámci CME pracujete - abych čekal co všechno se změní

### Co se asi pak musí upravit (oproti současné alpha verzi): 
- Při posouvání skupiny vrcholů posouvat celou hranu místo posledního článku.

-----------
## Dialogy:
1. Všechny (úplně všechny?) dialogy dělat na styl jako create class dialog?
 - Některé teď nejsou přes kontext - třeba Connection dialog - https://github.com/mff-uk/dataspecer/blob/df071a86eba76910792c637105e078317e8d5146/applications/conceptual-model-editor/src/app/diagram/visualization.tsx#L519
2. Co to vlastně znamená krokově:
    1. Nějaký společný interface na props, kde je aspoň `isOpen`, `close` - https://github.com/mff-uk/dataspecer/blob/df071a86eba76910792c637105e078317e8d5146/applications/conceptual-model-editor/src/app/diagram/dialog/create-class-dialog.tsx#L27
    2. Ten je rozšířený o další properties dle používání, třeba `onSelectConfirmCallback?: (newEntityID: string[]) => void;` ... nebo tady `model` a `pozice`
    3. Context má `props` a `open` metodu v rámci, které se nastaví `isOpen` na true, dále `open` má typicky parametry, kde se nastaví ty specifické `props` - třeba ten callback
    4. V dialogs-context.tsx je pak provider dialogových kontextů - vrací pouze tu open metodu, nic jiného.
    5. `open` metoda pak vrací tu samotnou komponentu s nastavenými props, tak jak se `open` zavolalo

### Dělení na kontext, komponenta, controller - co je co?
- Komponenta je jasná
- Kontext - tj. ten useCreateClassDialog?
- Controller je ten provider? tj. něco co si k sobě vezme jednu konkrétní instanci kontextu a pak jí poskytuje dál.

-----------
## Otázky obecně:
1) code-style obecný - asi máme stejný akorát if/else píšu jinak 
2) Psaní objektů na jeden řádek ... například `{ x: 0, y: 0 }`
3) Kam s typama
4) Metody uvnitř metod
5) Jak by se měly řešit takové ty mapy ohledně indentace ... například https://github.com/mff-uk/dataspecer/blob/47e589e7fd77f02d05543b472273dd99053e36de/applications/conceptual-model-editor/src/app/diagram/reactflow/alignment.ts#L351-L358
6) reuse typů - např. Point vs XYPosition

------------- 
## Otázky z pull requestu:
1) Pojmenování typů (suffix Type)
2) TODOs do jednoho speciálního issue (možná si udělám v nějaké privátní repository, když nad tím přemýšlím)
3) Jednopísmenné proměnné
4) props spreading
5) Handlery, funkce, callbacky jako proměnný mimo TSX, v TSX teda asi jen renderování.
6) Co je controller/service
7) TODOs na lokalizaci
8) Ten poslední komentář - Vracení null u conditional komponent (zrovna třeba ty dialogy)
9) builder

----------------
## Alignment otázky:
1) Měl bych nějak v budoucích rozšířeních CME počítat s možnými změnami diagramu, které nevychází od uživatele, například - U alignmentu se počítá, že se se seznam vrcholů nezmění po začátku táhnutí (dá se asi vyřešit skrz useStore, nebo useEffect spíš je otázka jestli to má cenu)

2) Pozice ve vizuálním modelu vs snapgrid - https://github.com/mff-uk/dataspecer/blob/9d89ded5bf2388fd2a2b83742d0c686946337238/packages/core-v2/src/visual-model/visual-model.ts#L183-L194

------------------
Teď mě napadlo jestli tam je nějaký rozdíl mezi onNodesChange a onDrag v reactflow - zmíněno ve slacku.

------------------
## Co mi se nezdálo ve stávajíci architektuře/řešení:
- canvas-context a fakt, že se používá jen v katalogu jako lokální sledování viditelnosti, ale možná pro to byl dobrý důvod.
    - context/canvas-context.ts - https://github.com/mff-uk/dataspecer/blob/main/applications/conceptual-model-editor/src/app/diagram/context/canvas-context.ts
    - util/canvas-utils.ts - https://github.com/mff-uk/dataspecer/blob/main/applications/conceptual-model-editor/src/app/diagram/util/canvas-utils.ts
    - provider je pak v entities-of-model.tsx - https://github.com/mff-uk/dataspecer/blob/main/applications/conceptual-model-editor/src/app/diagram/catalog/components/entities-of-model.tsx
- Update vizuálního modelu při každé drag eventě - to už je ale fixlé (částečně - stále mažeme selekce hran, ale to možná ani nevadí)
- Při vytvoření nového modelu - explicitně nepřidané vizuální elementy jsou null v rámci agregátoru, stejně tak když přidám vrchol na plátno, tak ty nově přidané hrany jsou null, dokud explicitně nezměnim viditelnost. Vrcholy asi tak nevadí, hrany jsou divný.
- V katalogu prop-drilling handlerů (začíná to v EntitiesOfModel), ale nakonec to možná není tak strašné, jsou to jen 3 úrovně.

----------
## Mimo:

CME autosave bug mě napadlo, že to možná bude tím, že proběhne hned při načtení stránky, tak možná není ten model v konzistentním stavu, ale nevim.
