# Variants

This is a collection of message examples which require a branching logic to
handle grammatical variations of the copy.

## Regular plurals

### English

    No items selected.
    1 item selected.
    2 items selected.
    5 items selected.

### Polish

    Brak zaznaczonych elementów.
    1 zaznaczony element.
    2 zaznaczone elementy.
    5 zaznaczonych elementów.

### Czech

    Žádné vybrané předměty.
    1 vybraný předmět.
    2 vybrané předměty.
    5 vybraných předmětů.

## Plurals optional in English

_item_ is skipped for brevity but can be assumed to be the subject.

### English

    1 selected
    2 selected
    5 selected

### Polish

    1 zaznaczony
    2 zaznaczone
    5 zaznaczonych

## Gender

### English

    Anne published a post in Birthday Party
    John published a post in Birthday Party

### Polish

    Anne opublikowała post w grupie Birthday Party
    John opublikował post w grupie Birthday Party

## Gender and Plurals

### English

    Anne and John published a post in Birthday Party
    Anne and Mary published a post in Birthday Party
    John and Mark published a post in Birthday Party

### Polish

    Anne i John opublikowali post w grupie Birthday Party
    Anne i Mary opublikowały post w grupie Birthday Party
    John i Mark opublikowali post w grupie Birthday Party

## Vocative form

### English

     Hello [user], ---> wrong Czech: Pavel
     Hello [first_name], ---> wrong Czech: Petra
     Hello [full_name], ---> wrong Czech: David Filip

### wrong Czech

     Ahoj [user], ---> wrong Czech: Pavel
     Ahoj [first_name], ---> wrong Czech: Petra
     Ahoj [full_name], ---> wrong Czech: David Filip

### Czech (with canDelete="yes" on the placeholders)

     Dobrý den,
     Dobrý den,
     Dobrý den,

### Czech with a vocative aware formatter

     Ahoj [user-vocative], ---> correct Czech: Pavle
     Ahoj [first_name-vocative], ---> correct Czech: Petro
     Ahoj [full_name-vocative], ---> correct Czech: Davide Filipe
