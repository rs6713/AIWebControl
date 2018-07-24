def maxCuts(length, cuts):
    global table_cuts
    print("Entering", length, cuts)
    if(table_cuts[length-1][len(cuts)-1]>= 0):
        return table_cuts[length-1][len(cuts)-1]
    if(length==0):
        print(length, cuts, 0)
        return 0
    if(len(cuts)==0 or length<0):
        print(length, cuts, "Length too small or cuts 0")
        return -1
    
    noCuts=max(  maxCuts(length, cuts[1:]) , maxCuts(length-cuts[0], cuts)+1)
    table_cuts[length-1][len(cuts)-1]=noCuts
    if(noCuts<=0):
        print(length, cuts, "Impossible route")
        return -1
    print(length, cuts, noCuts)
    return noCuts

no_tests= int(input().strip())
for _ in range(no_tests):
    length=int(input())
    cuts=list(map(int, input().strip().split(" ")))
    table_cuts=[[-1]*len(cuts) for _ in range(length)]
    print(table_cuts)
    print(maxCuts(length, cuts))
