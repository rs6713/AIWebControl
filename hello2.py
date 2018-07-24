#code
'''
def maxCuts(length, cuts):
    global table_cuts

    if(length==0):
        #print(length, cuts, 0)
        return 0

    if(len(cuts)==0 or length<0):
        #print(length, cuts, "Length too small or cuts 0")
        return -1
    if(length % cuts[0]==0):
        return (length/cuts[0])
                
    #print("Entering", length, cuts)
    if(table_cuts[length-1][len(cuts)-1]>= 0):
        return table_cuts[length-1][len(cuts)-1]
    
    noCuts=max(  maxCuts(length, cuts[1:]) , maxCuts(length-cuts[0], cuts)+1)
    table_cuts[length-1][len(cuts)-1]=noCuts
    if(noCuts<=0):
        #print(length, cuts, "Impossible route")
        return -1
    #print(length, cuts, noCuts)
    return noCuts
'''

def maxCuts(total, no_steps):
    global lengths, length, cuts
    if(lengths[-1]!=0):
        return 
    if(total>length):
        return 
    for c in cuts:
        if( (length-total) % c==0):
            lengths[-1]=no_steps+ int( (length-total)/c)
            #print(int(length/c))
            
        if((total+c)<=length):
            no_steps+=1
            if(no_steps <= lengths[total+c]):
                return
            else:
                lengths[total+c]=no_steps
                maxCuts(total+c, no_steps)
    

no_tests= int(input().strip())
for _ in range(no_tests):
    length=int(input().strip())
    cuts=list(map(int, input().strip().split(" ")))
    cuts.sort()
    #cuts.reverse()
    table_cuts=[[-1]*len(cuts) for _ in range(length)]
    #print(table_cuts)
    lengths=[0]*(length+1)

    for c in cuts:
        if(length% c==0):
            print(int(length/c))
            break
    else:
        maxCuts(0, 0)
        print(lengths[-1])
        #print(maxCuts(0, cuts))
    #print(table_cuts)
