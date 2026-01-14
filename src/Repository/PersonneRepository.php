<?php

namespace App\Repository;

use App\Entity\Personne;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Personne|null find($id, $lockMode = null, $lockVersion = null)
 * @method Personne|null findOneBy(array $criteria, array $orderBy = null)
 * @method Personne[]    findAll()
 * @method Personne[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PersonneRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Personne::class);
    }

    public function getAllPaymentMethods(): array
    {
        $qb = $this->createQueryBuilder('p');

        $qb->select('p.moyenPaiement')
            ->distinct()
            ->where('p.moyenPaiement IS NOT NULL');

        $query = $qb->getQuery();

        return array_column($query->getResult(), 'moyenPaiement');
    }

    /**
     * Recherche des personnes avec filtrage multi-champs (OR).
     * La recherche est insensible à la casse et aux accents grâce à la collation MySQL.
     *
     * @param string $query Terme de recherche
     * @param bool $unassignedOnly Si true, retourne uniquement les personnes sans table
     * @param int $page Numéro de page (commence à 1)
     * @param int $limit Nombre d'éléments par page
     * @return array{items: Personne[], total: int, page: int, limit: int, pages: int}
     */
    public function search(string $query, bool $unassignedOnly = false, int $page = 1, int $limit = 50): array
    {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.table', 't')
            ->leftJoin('p.categorie', 'cat')
            ->leftJoin('p.civilite', 'civ');

        // Recherche multi-champs avec OR
        if (!empty($query)) {
            $qb->andWhere(
                $qb->expr()->orX(
                    $qb->expr()->like('p.nom', ':query'),
                    $qb->expr()->like('p.prenom', ':query'),
                    $qb->expr()->like('p.email', ':query'),
                    $qb->expr()->like('p.telephone', ':query'),
                    $qb->expr()->like('p.ville', ':query')
                )
            )->setParameter('query', '%' . $query . '%');
        }

        // Filtre pour les personnes non assignées
        if ($unassignedOnly) {
            $qb->andWhere('p.table IS NULL');
        }

        // Tri par nom
        $qb->orderBy('p.nom', 'ASC')
            ->addOrderBy('p.prenom', 'ASC');

        // Compte total avant pagination
        $countQb = clone $qb;
        $countQb->select('COUNT(p.id)');
        $total = (int) $countQb->getQuery()->getSingleScalarResult();

        // Pagination
        $offset = ($page - 1) * $limit;
        $qb->setFirstResult($offset)
            ->setMaxResults($limit);

        $items = $qb->getQuery()->getResult();

        return [
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => (int) ceil($total / $limit),
        ];
    }

    // /**
    //  * @return Personne[] Returns an array of Personne objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('p.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Personne
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
