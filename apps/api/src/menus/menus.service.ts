import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MenuItemPlacement, MenuItemType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

const menuInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      icon: true,
    },
  },
  children: {
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          icon: true,
        },
      },
    },
  },
} satisfies Prisma.MenuItemInclude;

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.menuItem.findMany({
      where: { parentId: null },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      include: menuInclude,
    });
  }

  async create(dto: CreateMenuDto) {
    const parent = dto.parentId ? await this.ensureExists(dto.parentId) : null;
    const sortOrder = dto.sortOrder ?? await this.nextSortOrder(dto.parentId ?? null);
    const href = await this.resolveHref(dto.type ?? MenuItemType.INTERNAL, dto.href, dto.categoryId);

    return this.prisma.menuItem.create({
      data: {
        title: dto.title,
        href,
        type: dto.type ?? MenuItemType.INTERNAL,
        placement: parent ? MenuItemPlacement.MEGA : (dto.placement ?? MenuItemPlacement.MAIN),
        description: dto.description,
        badge: dto.badge,
        icon: dto.icon,
        groupName: dto.groupName,
        isVisible: dto.isVisible ?? true,
        opensInNewTab: dto.opensInNewTab ?? false,
        sortOrder,
        categoryId: dto.categoryId,
        parentId: dto.parentId,
      },
      include: menuInclude,
    });
  }

  async update(id: string, dto: UpdateMenuDto) {
    const existing = await this.ensureExists(id);
    const parentId = dto.parentId !== undefined ? dto.parentId : existing.parentId;
    const parent = parentId ? await this.ensureExists(parentId) : null;
    const type = dto.type ?? existing.type;
    const categoryId = dto.categoryId !== undefined ? dto.categoryId : existing.categoryId;
    const href = await this.resolveHref(type, dto.href ?? existing.href ?? undefined, categoryId ?? undefined);

    if (parentId === id) {
      throw new ConflictException('A menu item cannot be its own parent');
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        title: dto.title,
        href,
        type,
        placement: parent ? MenuItemPlacement.MEGA : (dto.placement ?? existing.placement),
        description: dto.description,
        badge: dto.badge,
        icon: dto.icon,
        groupName: dto.groupName,
        isVisible: dto.isVisible,
        opensInNewTab: dto.opensInNewTab,
        sortOrder: dto.sortOrder,
        categoryId,
        parentId,
      },
      include: menuInclude,
    });
  }

  reorder(updates: { id: string; sortOrder: number }[]) {
    return this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.menuItem.update({
          where: { id: update.id },
          data: { sortOrder: update.sortOrder },
        }),
      ),
    );
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.menuItem.delete({ where: { id } });
    return { success: true };
  }

  async seedDefaults() {
    const existingCount = await this.prisma.menuItem.count();
    if (existingCount > 0) {
      return { created: 0, skipped: true };
    }

    const categories = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { children: { orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] } },
    });

    const bySlug = (slug: string) => categories.find((category) => category.slug === slug);

    const latest = await this.prisma.menuItem.create({
      data: {
        title: 'Latest News',
        href: '/search?q=latest',
        type: MenuItemType.INTERNAL,
        placement: MenuItemPlacement.MAIN,
        description: 'Top stories, breaking updates and fresh reports.',
        icon: '📰',
        sortOrder: 0,
      },
    });

    const liveScores = await this.prisma.menuItem.create({
      data: {
        title: 'Live Scores',
        href: '/schedule',
        type: MenuItemType.INTERNAL,
        placement: MenuItemPlacement.MAIN,
        description: 'Fixtures, results, scorecards and standings.',
        icon: '📊',
        sortOrder: 1,
      },
    });

    const sportSlugs = ['cricket', 'football', 'nba', 'nfl'];
    let sortOrder = 2;
    const mainItems = await Promise.all(
      sportSlugs.map(async (slug) => {
        const category = bySlug(slug);
        if (!category) return null;
        return this.prisma.menuItem.create({
          data: {
            title: category.name,
            href: `/category/${category.slug}`,
            type: MenuItemType.CATEGORY,
            placement: MenuItemPlacement.MAIN,
            description: `Dedicated ${category.name.toLowerCase()} coverage, scores and analysis.`,
            icon: category.icon ?? undefined,
            sortOrder: sortOrder++,
            categoryId: category.id,
          },
        });
      }),
    );

    const latestChildren = [
      {
        title: 'Top Stories',
        href: '/',
        groupName: 'Editorial',
        description: 'Homepage lead package and editor picks.',
      },
      {
        title: 'Breaking News',
        href: '/search?q=breaking',
        groupName: 'Editorial',
        description: 'Fastest developing stories and urgent updates.',
      },
      {
        title: 'Trending Now',
        href: '/search?q=trending',
        groupName: 'Newsroom',
        description: 'Most-read stories across every sport.',
      },
      {
        title: 'Transfer Rumors',
        href: '/search?q=rumors',
        groupName: 'Newsroom',
        description: 'Rumors, insider chatter and movement watch.',
      },
      {
        title: 'Analysis',
        href: '/search?q=analysis',
        groupName: 'Features',
        description: 'Deep dives, explainers and tactical reads.',
      },
    ];

    await Promise.all(
      latestChildren.map((child, index) =>
        this.prisma.menuItem.create({
          data: {
            ...child,
            type: MenuItemType.INTERNAL,
            placement: MenuItemPlacement.MEGA,
            parentId: latest.id,
            sortOrder: index,
          },
        }),
      ),
    );

    const liveChildren = [
      {
        title: 'All Fixtures',
        href: '/schedule',
        groupName: 'Scores',
        description: 'Daily match list across all tracked sports.',
      },
      {
        title: 'Standings',
        href: '/standings',
        groupName: 'Scores',
        description: 'Tables, records and qualification picture.',
      },
      {
        title: 'Cricket Scores',
        href: '/category/cricket',
        groupName: 'Sports',
        description: 'Live scorecards and completed cricket matches.',
      },
      {
        title: 'Football Scores',
        href: '/category/football',
        groupName: 'Sports',
        description: 'Football fixtures, results and headlines.',
      },
    ];

    await Promise.all(
      liveChildren.map((child, index) =>
        this.prisma.menuItem.create({
          data: {
            ...child,
            type: MenuItemType.INTERNAL,
            placement: MenuItemPlacement.MEGA,
            parentId: liveScores.id,
            sortOrder: index,
          },
        }),
      ),
    );

    await Promise.all(
      mainItems.filter(Boolean).map(async (item) => {
        const category = categories.find((entry) => entry.id === item!.categoryId);
        if (!category) return;

        const childItems = [
          {
            title: `All ${category.name}`,
            href: `/category/${category.slug}`,
            groupName: 'Coverage',
            description: `All stories from the ${category.name} desk.`,
          },
          {
            title: 'Fixtures & Results',
            href: '/schedule',
            groupName: 'Coverage',
            description: 'Schedules, live trackers and final scores.',
          },
        ];

        if (category.slug === 'cricket') {
          childItems.push({
            title: 'Player Stats',
            href: '/players',
            groupName: 'Resources',
            description: 'Player search, batting and bowling profiles.',
          });
        }

        category.children.slice(0, 4).forEach((child) => {
          childItems.push({
            title: child.name,
            href: `/category/${child.slug}`,
            groupName: 'Subcategories',
            description: `Go straight to ${child.name.toLowerCase()} coverage.`,
          });
        });

        await Promise.all(
          childItems.map((child, index) =>
            this.prisma.menuItem.create({
              data: {
                ...child,
                type: MenuItemType.INTERNAL,
                placement: MenuItemPlacement.MEGA,
                parentId: item!.id,
                sortOrder: index,
              },
            }),
          ),
        );
      }),
    );

    return { created: await this.prisma.menuItem.count(), skipped: false };
  }

  private async nextSortOrder(parentId: string | null) {
    return this.prisma.menuItem.count({ where: { parentId } });
  }

  private async resolveHref(type: MenuItemType, href?: string, categoryId?: string) {
    if (type === MenuItemType.CATEGORY) {
      if (!categoryId) throw new NotFoundException('Category is required for category menu items');
      const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      return `/category/${category.slug}`;
    }

    if (!href?.trim()) {
      throw new ConflictException('A destination is required for non-category menu items');
    }

    return href.trim();
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }
}
