package ast;

import java.util.*;

/**
 * @author GAO RISHENG This class is in charge of AST node construction and
 *         syntax generation of Switch statements in C/Java programs(The syntax
 *         in C and in Java are exactly the same) (Python does not support
 *         swtich statement)
 */
public class ASTSwitchStatement extends ASTBlockStatement {
	private static final String NODE_TYPE = "Switch Statement";
	ASTExpression exp;
	ArrayList<ASTExpression> cases;
	ArrayList<ArrayList<ASTStatement>> blocks;
	ArrayList<ASTStatement> defaultBranch;
	int currentCase;

	public ASTSwitchStatement(ASTExpression exp) {
		super();
		this.exp = exp;
		exp.addParent(this);
		this.cases = new ArrayList<ASTExpression>();
		this.blocks = new ArrayList<ArrayList<ASTStatement>>();
		this.defaultBranch = new ArrayList<ASTStatement>();
		currentCase = -1;
	}

	public void addCase(ASTExpression exp) {
		this.cases.add(exp);
		exp.addParent(this);
		this.blocks.add(new ArrayList<ASTStatement>());
		currentCase++;
	}

	public void addDefault() {
		this.currentCase = -1;
	}

	public void addStatement(ASTStatement statement) {
		if (this.currentCase == -1) {
			this.defaultBranch.add(statement);
			statement.addParent(this);
		} else {
			this.blocks.get(this.currentCase).add(statement);
			statement.addParent(this);
		}
	}

	public String toSyntax() {
		this.result = "switch (";
		this.result += this.exp.toSyntax() + ") {\n";
		for (int i = 0; i < this.cases.size(); i++) {
			for(int k = 0; k < this.indent; k++) this.result+="\t";
			this.result += "\tcase ";
			this.result += this.cases.get(i).toSyntax();
			this.result += ":";
			if (this.blocks.get(i).isEmpty()) {
				this.result += "\n";
			} else {
				this.result += "\n";
				for (int j = 0; j < this.blocks.get(i).size(); j++) {
					for(int k = 0; k < this.indent; k++) this.result+="\t";
					this.result += "\t\t";
					this.result += this.blocks.get(i).get(j).toSyntax();
				}
				this.result += "\n";

			}
		}
		if (!this.defaultBranch.isEmpty()) {
			for(int i = 0; i < this.indent; i++) this.result+="\t";
			this.result += "\tdefault:\n";
			for (int k = 0; k < this.defaultBranch.size(); k++) {
				for(int i = 0; i < this.indent; i++) this.result+="\t";
				this.result += "\t\t";
				this.result += this.defaultBranch.get(k).toSyntax();
			}
			this.result += "\n";
		}
		for(int i = 0; i < this.indent; i++) this.result+="\t";
		this.result += "}\n";
		return this.result;
	}

	public String typeof() {
		return super.typeof() + "->" + NODE_TYPE;
	}

	public String toTree(int indent) {
		StringBuilder sb = new StringBuilder("");
		for (int i = 0; i < indent; i++) {
			sb.append("\t");
		}
		sb.append(this.typeof());
		sb.append("\n");
		for (int j = 0; j < this.cases.size(); j++) {
			for (int k = 0; k < indent + 1; k++) {
				sb.append("\t");
			}
			sb.append("case");
			sb.append("\n");
			for (ASTStatement s : this.blocks.get(j)) {
				sb.append(s.toTree(indent + 2));
				sb.append("\n");
			}

		}
		for (int k = 0; k < indent + 1; k++) {
			sb.append("\t");
		}
		sb.append("case");
		sb.append("\n");
		for (ASTStatement s : this.defaultBranch) {
			sb.append(s.toTree(indent + 2));
			sb.append("\n");
		}
		return sb.toString();
	}
}
